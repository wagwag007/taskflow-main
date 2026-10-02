import { useState } from 'react';

function Contador() {
  const [valor, setValor] = useState(0);

  return (
    <div>
      {/* <p>Valor: {contador}</p> */}
      <p>Valor: {valor}</p>
      <button onClick={() => setValor(valor + 1)}>
        Incrementar
      </button>
    </div>
  );
}

export default Contador;