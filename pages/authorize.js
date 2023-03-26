import { useState } from "react"
import AuthorizeApp from "../components/AuthorizeApp"
import LoginForm from "../components/LoginForm"


export default function Authorize({user, app, url, token}){
    const [credential, setCredential] = useState("")
    const [pass, setPass] = useState("")
    let initialRender = <></>
    if (!user){
        initialRender = <LoginForm reload={true}/>
}else{
    initialRender = 
    <>
    <AuthorizeApp token={token} url={url} redirect_uri={app.app.redirect_uri} user={user} name={app.app.name} scopes={app.scopes}/>
    </>
}

return (initialRender)
}

export async function getServerSideProps(context){
    const cookies = context.req.cookies
    const url = context.req.url.split("?")[1]
    const url_data = new URLSearchParams(url)

    const client_id = url_data.get("client_id") // Mandatory
    const redirect_uri = url_data.get("redirect_uri") // Mandatory
    const response_type = url_data.get("response_type") // Mandatory
    const scope = url_data.get("scope") ? url_data.get("scope") : 'user-info'
    if (!client_id || !redirect_uri || response_type !== "code"){
        return{
            notFound:true,
        }
    }

    if (!cookies.mshortener_account_auth){
        return {
            props:{
            
        }
        }
    }
    const resp = await fetch(process.env.API_ENDPOINT + "session/validate", {
        "method":"POST",
        headers:{
            "Content-type":"application/x-www-form-urlencoded"
        },
        body:"token=" + cookies.mshortener_account_auth
        })
        console.log(resp.status)
        if (resp.status !== 200){
            return{
                props:{
                    
                }
            }
        }else{
        const user = await resp.json()
        const app_data = await fetch(process.env.API_ENDPOINT + "v1/applications/fetch.json?" + url, {
            method:"POST",
            headers:{
                "Content-type":"application/x-www-form-urlencoded",
                "Authorization":"Basic " + btoa(process.env.APP_PUBLIC + ":" + process.env.APP_SECRET)
            }          
        })
        if (app_data.status !== 200){
            return {
                notFound:true,
            }
        }
        const app = await app_data.json()
    return{
        props:{
            user:user.user,
            "app":app,
            url,
            "token":cookies.mshortener_account_auth,
        }
    }
}
}