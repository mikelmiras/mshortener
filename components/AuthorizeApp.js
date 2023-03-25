export default function AuthorizeApp({name, scopes, user, redirect_uri}){
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
            <button>Cancel</button>
            <button>Authorize</button>
        </div>
    </div>
    )
}