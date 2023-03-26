import { useEffect, useState } from "react"

export default function AuthorizeApp({name, scopes, user, redirect_uri, url, token}){
    const [click, setCLick] = useState(false)
    return(
    <div>
        <h2>An external application</h2>
        <h1>{name}</h1>
        <h2>wants to access your MShortener account</h2>
        <p>Logged in as {user.username}</p>
        <hr/>
        {scopes.map(item=>{
            return(<p key={item.name}>{item .descr}</p>)
        })}
        <hr/>
        <h2>When you grant access, you will be redirected to: {redirect_uri}</h2>
        <div className="btns">
            <button onClick={(e)=>{
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
            }}>Authorize</button>
        </div>
    </div>
    )
}