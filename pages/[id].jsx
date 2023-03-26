export default function Id(){
    return(<><h1>Mshortener</h1></>)
}


export async function getServerSideProps(context){
    const {params} = context
    const {id} = params
    const resp = await fetch(process.env.API_ENDPOINT + "links/redirect.json?id=" + id, {
        headers: {
            "Authorization":"Basic " + btoa(process.env.APP_PUBLIC + ":" + process.env.APP_SECRET)
        }
    })
    if (resp.status !== 200){
        return {
            notFound:true,
        }
    }
    const data = await resp.json()
    return {
        redirect:{
            destination:data.redirect_uri,
            permanent:true,
        }
    }
}