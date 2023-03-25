import { useState } from "react"
import LoginForm from "../components/LoginForm"


export default function Authorize({user}){
    const [credential, setCredential] = useState("")
    const [pass, setPass] = useState("")
    let initialRender = <></>
    if (!user){
        initialRender = <LoginForm reload={true}/>
}else{
    initialRender = <h1>You are logged in</h1>
}

return (initialRender)
}

export async function getServerSideProps(context){
    const cookies = context.req.cookies
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