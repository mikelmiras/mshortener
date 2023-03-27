import { useEffect, useState } from "react";
import { isUserLoggedIn, MainSection } from ".";
import Header from "../components/Header";
import {FiBarChart2} from "react-icons/fi"
import { Line } from "react-chartjs-2";
import Chart from 'chart.js/auto';
import {BsCalendarDate} from "react-icons/bs"
export default function Account({user, links, token}){
    const [link, setLink] = useState(links)
    return(<>
    <Header user={user}/>
    <MainSection>
        <h1>Your links:</h1>
        <div className="links-container">
        <LinksDisplay token={token} links={link}/>
        </div>
    </MainSection>
    </>)
}

export function LinksDisplay({links, token}){
    const [selected, setSelectedtxt] = useState("Please, select a link")
    const [selectedLink, setSelectedLink] = useState(undefined)
    const [charData, setCharData] = useState(undefined)
    useEffect(()=>{
        if (!charData) return
        setSelectedtxt(
            <>
            <div className="link-holder-info">
            <h1>{selectedLink.url}</h1>
            <h1 className="date-text"><BsCalendarDate/> {new Date(selectedLink.date).toLocaleString("es-ES")}</h1>
            <h1 className="date-text"><FiBarChart2/> {selectedLink.count} engagement</h1>
            </div>
            <LineChart chartData={charData} title={"Link impressions"} desc={"Visits received by this link during the last 30 days"} />
            </>
        )
    }, [charData])
    useEffect((e)=>{
        if (!selectedLink) setSelectedtxt("Please, select a link")
        else {
            setSelectedtxt('Loading...')
            fetch('/api/v1/links/fetch.json?id=' + selectedLink.id, {
                headers:{
                    "Authorization":"Bearer " + token
                }
            }).then(data=>data.json()).then(data=>{
                if (data.impressions.length == 0){
                        setSelectedtxt(
                        <>
                        <div className="link-holder-info">
                        <h1>{selectedLink.url}</h1>
                        <h1 className="date-text"><BsCalendarDate/> {new Date(selectedLink.date).toLocaleString("es-ES")}</h1>
                        <h1 className="date-text"><FiBarChart2/> {selectedLink.count} engagement</h1>
                        </div>
                        </>)
                    return;
                }else{
                setCharData({
                    labels: data.impressions.map((k) => k.day), 
                    datasets: [
                      {
                        label: "Impressions on this day ",
                        data: data.impressions.map((data) => (data.count)),
                        backgroundColor: [
                          "rgba(75,192,192,1)",
                          "#ecf0f1",
                          "#50AF95",
                          "#f3ba2f",
                          "#2a71d0"
                        ],
                        borderColor: "white",
                        borderWidth: 2
                      }
                    ]
                  })
                }
            })
        }
    }, [selectedLink])
    if (!links || links.length == 0){
        return(<h2>There are no links</h2>)
    }else{
        return(
            <>
            <div className="links">
        {links.map(link => {
            return(<><div onClick={(e)=>{
                setSelectedLink(link)
            }} className="link"><h1>{link.id}</h1><h2 className="url-link">{link.url}</h2><p>{new Date(link.date).toLocaleString("es-ES")}</p>
            <p><FiBarChart2/> {link.count}</p>
            </div></>)
        })}
        </div>
        <div className="selected-link">{selected}</div>
        </>
        )
    }
}


export async function getServerSideProps({req, res}){
    const isLoggedIn = await isUserLoggedIn(req.cookies.mshortener_account_auth)
    if (!isLoggedIn){
        return{
                redirect:{
                    destination:process.env.MAIN_URL + "/login",
                    permanent:false,
                }
        }
    }else{
        const links_data = await fetch(process.env.API_ENDPOINT + "v1/links/fetch.json", {
            headers:{
                "Authorization":"Bearer " + req.cookies.mshortener_account_auth
            }
        })
        const links = await links_data.json()
        return {
            props:{
                "user":isLoggedIn.data,
                "links":links.links,
                "token":req.cookies.mshortener_account_auth,
            }
        }
    }
}

export function LineChart({ chartData, title, desc }) {
    return (
      <div className="chart-container">
        <h2 style={{ textAlign: "center" }}>{title}</h2>
        <Line
          data={chartData}
          options={{
            plugins: {
              title: {
                display: true,
                text: desc
              },
              legend: {
                display: false
              }
            }
          }}
        />
      </div>
    );
  }