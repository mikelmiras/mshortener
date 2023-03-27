import { useState } from "react";
import { isUserLoggedIn, MainSection } from ".";
import Header from "../components/Header";

export default function Account({user, links}){
    const [link, setLink] = useState(links)
    return(<>
    <Header user={user}/>
    <MainSection>
        <h1>Your links:</h1>
        <LinksDisplay links={link}/>
    </MainSection>
    </>)
}

export function LinksDisplay({links}){
    if (!links || links.length == 0){
        return(<h2>There are no links</h2>)
    }else{
        return(
            <>
        {links.map(link => {
            return(<><h1>{link.id}</h1><p>{link.url}</p></>)
        })}
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