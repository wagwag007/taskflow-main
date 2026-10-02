import Axios from 'axios'

function TasteAxios() {
   async function exemplo() {
      try {
         const resposta = await Axios.get('https://jsonplaceholder.typicode.com/posts')}


         console.log('response', resposta);
         console.log('Response data', resposta.data);
         console.log('Response name', resposta.data.name);
         console.log('Response status', resposta.status);
      } catch (error) {
         console.log('Error message', error.message);
      }

      return (

      )

}






    export default TasteAxios