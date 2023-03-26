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

    const resp = await fetch(process.env.API_ENDPOINT + "v1/me", {
        headers:{
            "Authorization":"Bearer " + cookie
        }
    })
    if (resp.status!== 200){
        return{
            props:{

            }
        }
    }

    return{
        redirect:{
        destination:process.env.MAIN_URL + "/account",
        permanent:false,
    }
    }
    
}