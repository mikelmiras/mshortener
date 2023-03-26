export default function Prueba({data}){
    return(<h1>{data}</h1>)
}


export async function getServerSideProps(){
    return{
        props:{
            "data":process.env.PGHOST
        }
    }
}