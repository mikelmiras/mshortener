import { isUserLoggedIn, MainSection } from ".";
import Header from "../components/Header";

export default function Account({user}){
    return(<>
    <Header user={user}/>
    <MainSection>
        <h1>Your links:</h1>
    </MainSection>
    </>)
}



export async function getServerSideProps({req, res}){
    const isLoggedIn = await isUserLoggedIn(req.cookies.mshortener_account_auth)
    if (!isLoggedIn){
        return{
                redirect:{
                    destination:process.env.MAIN_URL + "/login",
                    permanent:false,
                }
        }
    }else{
        return {
            props:{
                "user":isLoggedIn.data
            }
        }
    }
}