import { useState } from "react";
export default function LoginForm({reload}){
    const [credential, setCredential] = useState("")
    const [pass, setPass] = useState("")
    return(
    <>
    <h1>Login to MShortener</h1>
    <form onSubmit={(e)=>{
        e.preventDefault()
        if (credential == "" && pass == ""){
            alert("Please, fill the inputs")
            return;
        }
        const body = new URLSearchParams()
        body.append("credential", credential)
        body.append("pass", pass)
        fetch("/api/login", {
            "method":"POST",
            mode:"cors",
            credentials:"same-origin",
            headers:{
                "Content-type":"application/x-www-form-urlencoded"
            },
            body:body.toString()
        }).then(data=>data.json()).then(data=>{
           if (reload){
            window.location = window.location
           }
        }              
            )
    }}>
        <input onChange={(e)=>{
            setCredential(e.target.value)
        }} type={"text"}></input>
        <input onChange={(e)=>{
            setPass(e.target.value)
        }} type={"password"} />
        <input type={"submit"}/>
    </form>
    </>)
}