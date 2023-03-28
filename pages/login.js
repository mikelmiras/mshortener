import { isUserLoggedIn } from ".";
import LoginForm from "../components/LoginForm";

export default function Login(){
    return(<LoginForm reload={true}/>)
}


export async function getServerSideProps({req, res}){
    const cookie = req.cookies.mshortener_account_auth
    if (!cookie){
    return {
        props:{

        }
    }
}

    const isLoggedIn = await isUserLoggedIn(cookie)
    console.log('Logged in: ' + isLoggedIn)
    if (isLoggedIn === undefined || isLoggedIn?.error){
        const date = new Date()
        date.setFullYear(2020)
        res.setHeader("Set-cookie", "mshortener_account_auth=1;Expires=" + date.toGMTString() + ";path=/;")
        return {
            props:{

            }
        }
    }else{
    return{
        redirect:{
        destination:process.env.MAIN_URL + "/account",
        permanent:false,
    }
    }
}
}