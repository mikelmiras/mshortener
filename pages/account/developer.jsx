
import Header from '../../components/Header'
import {isUserLoggedIn, MainSection} from '../index'
export default function Developer({user, apps}){
    return(
        <>
        <Header user={user}/>
        <MainSection>
            <h1>Your apps ({apps.applications.length}):</h1>
            <div className='create-new-app'>
                <input type={"text"} placeholder='Type app name' />
                <input type={"submit"} value="Create app"/>
            </div>
            {apps.applications.map(app=>{
                return(<>
                <h2>{app.name}</h2>
                <p>Created on: {new Date(app.date).toLocaleString("es-ES")}</p>
                <p>Public id: {app.public_id}</p>
                <h3>Allowed redirect URIS:</h3>
                <div className='redirect-uris'>
                    {app.uris.map(uri=>{
                        return(<><p>{uri} <span onClick={(e)=>{
                            navigator.clipboard.writeText(`http://localhost:3000/authorize?client_id=${app.public_id}&response_type=code&redirect_uri=${uri}&scope=user-info%20link-edit`)
                            }} className="copy-uri">Copy authorization url for this uri</span></p></>)
                    })}
                </div>
                </>)
            })}
        </MainSection>
        </>
    )
}
export async function getServerSideProps({req, res}){
    const isLoggedIn = await isUserLoggedIn(req.cookies.mshortener_account_auth)
    if (!isLoggedIn || isLoggedIn.error) {
        return{
                redirect:{
                    destination:process.env.MAIN_URL + "/login",
                    permanent:false,
                }
        }
    }else{
        const links_data = await fetch(process.env.API_ENDPOINT + "/applications/fetch.json?token=" + req.cookies.mshortener_account_auth, {
            headers:{
                "Authorization":"Basic " + btoa(process.env.APP_PUBLIC+":"+process.env.APP_SECRET)
            }
        })
        const apps = await links_data.json()

        return {
            props:{
                "user":isLoggedIn.data,
                apps,
            }
        }
    }
}
