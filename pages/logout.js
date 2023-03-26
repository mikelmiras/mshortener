import { redirect } from "next/dist/server/api-utils"

export default function Logout(){
    return(<><p>Loggin out...</p></>)
}


export async function getServerSideProps({req, res}){
    console.log(req.url)
    const oldDate = new Date()
    oldDate.setFullYear(2001)
    res.setHeader("Set-cookie", "mshortener_account_auth=expire;expires=" + oldDate.toGMTString())
    console.log(goto)
    return{
        redirect:{
            destination:process.env.MAIN_ENDPOINT, 
            permanent:false,
        }
    }
}