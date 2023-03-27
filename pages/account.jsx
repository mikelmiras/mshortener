import { useEffect, useState } from "react";
import { isUserLoggedIn, MainSection } from ".";
import Header from "../components/Header";

export default function Account({user, links}){
    const [link, setLink] = useState(links)
    return(<>
    <Header user={user}/>
    <MainSection>
        <h1>Your links:</h1>
        <div className="links-container">
        <LinksDisplay links={link}/>
        </div>
    </MainSection>
    </>)
}

export function LinksDisplay({links}){
    const [selected, setSelectedtxt] = useState("Please, select a link")
    const [selectedLink, setSelectedLink] = useState(undefined)
    useEffect((e)=>{
        if (!selectedLink) setSelectedtxt("Please, select a link")
        else setSelectedtxt(selectedLink)
    }, [selectedLink])
    if (!links || links.length == 0){
        return(<h2>There are no links</h2>)
    }else{
        return(
            <>
            <div className="links">
        {links.map(link => {
            return(<><div onClick={(e)=>{
                setSelectedLink(link.id)
            }} className="link"><h1>{link.id}</h1><h2>{link.url}</h2><p>{new Date(link.date).toLocaleString("es-ES")}</p></div></>)
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
                "links":links.links
            }
        }
    }
}