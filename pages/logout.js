import { redirect } from "next/dist/server/api-utils"

export default function Logout(){
    return(<><p>Loggin out...</p></>)
}


export async function getServerSideProps({req, res}){
    const oldDate = new Date()
    oldDate.setFullYear(2001)
    res.setHeader("Set-cookie", "mshortener_account_auth=expire;expires=" + oldDate.toGMTString())
    return{
        redirect:{
            destination:(req.headers.referer || req.headers.referrer) || process.env.MAIN_URL, 
            permanent:false,
        }
    }
}