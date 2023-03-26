import { useState } from "react";
export default function LoginForm({reload}){
    const [credential, setCredential] = useState("")
    const [pass, setPass] = useState("")
    return(
    <>
    <div className="oauth2-wrapper">
    <img onClick={(e)=>{
        window.location.href = "/"
    }} src="./logo.png" className="absolute-logo"/>
        <div className="oauth2 login-window">
    <h1>Login to MShortener</h1>
    <form onSubmit={(e)=>{
        e.preventDefault()
        if (credential == "" && pass == ""){
            let elem = document.querySelector("#err-msg")
            if (elem === undefined) return;
            elem.innerHTML="Please, fill the inputs to proceed"
            elem.className = "error-msg"
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
        <input placeholder="Username or email" onChange={(e)=>{
            setCredential(e.target.value)
        }} type={"text"}></input>
        <input placeholder="Password" onChange={(e)=>{
            setPass(e.target.value)
        }} type={"password"} />
        <input className="primary" type={"submit"} value="Log in"/>
        <p id="err-msg" className="error-msg hidden">Default no-error msg</p>
        <hr/>
        <button className="secondary">Create an account</button>
    </form>
    </div>
    </div>
    </>)
}