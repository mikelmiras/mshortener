import { useEffect, useState } from "react"
import {AiOutlineCheckCircle} from "react-icons/ai"
export default function AuthorizeApp({name, scopes, user, redirect_uri, url, token}){
    const [click, setCLick] = useState(false)
    return(
    <div className="oauth2-wrapper">
        <img src="./logo.png" className="absolute-logo"/>
        <div className="oauth2">
            <div className="main-heading">
        <h2>An external application</h2>
        <h1>{name}</h1>
        <h2>wants to access your MShortener account</h2>
        <p>Logged in as <b>{user.username}</b> <a href="/logout">Logout</a></p>
        </div>
        <hr/>
        <h3>This will allow {name} application's developer to:</h3>
        <ul className="scope-list">
        {scopes.map(item=>{
            return(<li key={item.name}><span className="check"><AiOutlineCheckCircle/></span>{item .descr}</li>)
        })}
        </ul>
        <hr/>
        <h3 className="smaller-h3">When you grant access, you will be redirected to: {redirect_uri}</h3>
        <div className="btns">
            <button className="secondary" onClick={(e)=>{
                window.location.href = redirect_uri + "?error=access_denied"
            }}>Cancel</button>
            <button onClick={(e)=>{
                if (click) return;
                setCLick(true)
                fetch("/api/code/generate?" + url, {
                    method:"POST",
                    headers:{
                        "Content-type":"application/x-www-form-urlencoded"
                    },
                    body:"token=" + token
                }).then(data=>data.json()).then(data=>{
                    setCLick(false)
                    if (data.error){
                        alert("An error occurred")
                        return;
                    }
                    window.location.href = data.request.redirect_uri + "?code=" + data.code
                }).catch(e=>{
                    alert("Internal error")
                })
            }} className="primary">Authorize</button>
        </div>
    </div>
    </div>
    )
}