export default function Logout(){
    return(<><p>Loggin out...</p></>)
}


export async function getServerSideProps({req, res}){
    res.setHeader("Set-cookie", "mshortener_account_auth")
}