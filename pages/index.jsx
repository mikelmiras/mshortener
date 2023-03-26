import Header from "../components/Header"


export default function Index({user}){
    return(
        <>
        <Header user={user}/>
        <MainSection>
            <div className="first">
            <h1>Make Your Links Manageable and Memorable: Simplify Your URLs with Our Powerful URL Shortener App!</h1>
            </div>
            <div className="btn-input-wrapper">
            <button className="generate-button">Generate</button>
            <input type={"text"} placeholder="Paste here your long link..."/>
            </div>
            </MainSection>
        </>
    )
}


export function MainSection({children}){
    return(
        <section className="main-section">
            {children}
        </section>
    )
}

export async function getServerSideProps({req, res}){
    const islogged = await isUserLoggedIn(req.cookies.mshortener_account_auth)
    if (!islogged){
        return{
            props:{

            }
        }
    }else{
        return{
            props:{
                "user":islogged.data
            }
        }
    }
}


export async function isUserLoggedIn(cookie){
    console.log(cookie)
    if (!cookie) return undefined;
    const dat = await fetch(process.env.API_ENDPOINT + "v1/me", {
        headers:{
            "Authorization":"Bearer " + cookie
        }
    })
    if (dat.status !== 200) return undefined;    
    return await dat.json()
}