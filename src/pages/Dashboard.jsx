import "../App.css";
import Header from "../Componentes/Header";
import Kanban from "../Componentes/kanban";
import ModalTarefa from "../Componentes/ModalTarefa";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Componentes/contexts/AuthContext";
import api from "../api";

const statusPorColuna = {
  afazer: "pending",
  andamento: "inprogress",
  concluido: "done",
};

const colunaPorStatus = {
  pending: "afazer",
  inprogress: "andamento",
  done: "concluido",
};

function normalizarTarefa(tarefa) {
  const coluna = tarefa.coluna || colunaPorStatus[tarefa.status] || "afazer";
  return {
    ...tarefa,
    texto: tarefa.texto ?? tarefa.titulo ?? "",
    status: statusPorColuna[coluna] || tarefa.status || "pending",
    concluida: coluna === "concluido" || tarefa.concluida === true,
  };
}

export default function Home() {
  const { usuario } = useContext(AuthContext);
  const [tarefas, setTarefas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarTarefas() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await api.get("/tarefas");
        if (!Array.isArray(resposta.data)) {
          throw new Error("A API retornou uma lista de tarefas inválida.");
        }
        if (ativo) setTarefas(resposta.data.map(normalizarTarefa));
      } catch (error) {
        if (ativo) {
          setErro(
            error.response?.data?.erro ||
              error.message ||
              "Não foi possível carregar as tarefas. Verifique se a API está rodando."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarTarefas();

    return () => {
      ativo = false;
    };
  }, [usuario?.id]);

  const abrirCriar = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const abrirEditar = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleSave = async (taskData) => {
    setErro("");
    const dadosTarefa = {
      texto: taskData.texto,
      prioridade: taskData.prioridade,
      ...(taskData.status && { coluna: colunaPorStatus[taskData.status] }),
      ...(taskData.projetoId && { projetoId: taskData.projetoId }),
      ...(taskData.ordem !== undefined && { ordem: taskData.ordem }),
      usuarioId: taskData.id ? taskData.usuarioId : usuario?.id,
    };
    try {
      if (taskData.id) {
        const resposta = await api.put(`/tarefas/${taskData.id}`, dadosTarefa, {
          params: { usuarioId: taskData.usuarioId },
        });
        setTarefas((current) =>
          current.map((task) =>
            task.id === resposta.data.id ? normalizarTarefa(resposta.data) : task
          )
        );
      } else {
        const resposta = await api.post("/tarefas", dadosTarefa);
        setTarefas((current) => [...current, normalizarTarefa(resposta.data)]);
      }
      fecharModal();
    } catch (error) {
      setErro(error.response?.data?.erro || "Não foi possível salvar a tarefa.");
    }
  };

  const deletarTarefa = async (id) => {
    const tarefa = tarefas.find((item) => item.id === id);
    const usuarioTarefaId = tarefa?.usuarioId ?? usuario?.id;
    setErro("");
    try {
      await api.delete(`/tarefas/${id}`, {
        params: { usuarioId: usuarioTarefaId },
      });
      setTarefas((current) => current.filter((tarefa) => tarefa.id !== id));
      fecharModal();
    } catch (error) {
      setErro(error.response?.data?.erro || "Não foi possível excluir a tarefa.");
    }
  };

  const alternarConcluida = async (id, novoStatus) => {
    const tarefa = tarefas.find((item) => item.id === id);
    if (!tarefa) return;

    const status =
      novoStatus || (tarefa.status === "done" ? "pending" : "done");
    setErro("");
    try {
      const resposta = await api.put(
        `/tarefas/${id}`,
        { coluna: colunaPorStatus[status] },
        { params: { usuarioId: tarefa.usuarioId } }
      );
      setTarefas((current) =>
        current.map((item) =>
          item.id === id ? normalizarTarefa(resposta.data) : item
        )
      );
    } catch (error) {
      setErro(error.response?.data?.erro || "Não foi possível atualizar a tarefa.");
    }
  };

  return (
    <>
      <Header titulo=" TaskFlow " subtitulo="Gerencie suas tarefas" />
      <main className="container">
        {erro && <p role="alert">{erro}</p>}
        {carregando ? (
          <p>Carregando tarefas...</p>
        ) : (
          <Kanban
            tarefas={tarefas}
            usuarioId={usuario?.id}
            onAdicionar={abrirCriar}
            onDeletar={deletarTarefa}
            onConcluir={alternarConcluida}
            onEditar={abrirEditar}
          />
        )}

        <ModalTarefa
          isOpen={modalOpen}
          onClose={fecharModal}
          onSave={handleSave}
          onDelete={deletarTarefa}
          task={editingTask}
        />
      </main>
      <footer>
        <p>
          TaskFlow &copy; 2026 &mdash; wagner &mdash; Todos os direitos reservados.
        </p>
      </footer>
    </>
  );
}
