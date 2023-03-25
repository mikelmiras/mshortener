import { useState } from "react"
import AuthorizeApp from "../components/AuthorizeApp"
import LoginForm from "../components/LoginForm"


export default function Authorize({user}){
    const [credential, setCredential] = useState("")
    const [pass, setPass] = useState("")
    let initialRender = <></>
    if (!user){
        initialRender = <LoginForm reload={true}/>
}else{
    initialRender = 
    <>
    <h1>You are logged in</h1>
    <AuthorizeApp redirect_uri={"https://mmodsgtav.es"} user={user} name="MShortener" scopes={[{"name":"user-info", "descr":"View your account info, such as username and email."}]}/>
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
    const scope = url_data.get("scope")
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
    const resp = await fetch(process.env.API_ENDPOINT + "/session/validate", {
        "method":"POST",
        headers:{
            "Content-type":"application/x-www-form-urlencoded"
        },
        body:"token=" + cookies.mshortener_account_auth
        })
        console.log(resp.status + "")
        if (resp.status !== 200){
            return{
                props:{
                    
                }
            }
        }else{
        const user = await resp.json()
    return{
        props:{
            user:user.user
        }
    }
}
}