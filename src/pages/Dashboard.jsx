import "../App.css";
import Header from "../Componentes/Header";
import Kanban from "../Componentes/kanban";
import ModalTarefa from "../Componentes/ModalTarefa";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Componentes/contexts/AuthContext";

const TAREFAS_STORAGE_KEY_PREFIX = "taskflow:tarefas:";

function carregarTarefasSalvas(chave) {
  try {
    const tarefasSalvas = JSON.parse(localStorage.getItem(chave));
    return Array.isArray(tarefasSalvas) ? tarefasSalvas : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const { usuario } = useContext(AuthContext);
  const chaveTarefas = `${TAREFAS_STORAGE_KEY_PREFIX}${usuario?.id || "sem-usuario"}`;
  const [tarefas, setTarefas] = useState(() => carregarTarefasSalvas(chaveTarefas));
  const [proximaId, setProximaId] = useState(() => {
    const tarefasSalvas = carregarTarefasSalvas(chaveTarefas);
    return tarefasSalvas.reduce((maiorId, tarefa) => Math.max(maiorId, Number(tarefa.id) || 0), 0) + 1;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    localStorage.setItem(chaveTarefas, JSON.stringify(tarefas));
  }, [chaveTarefas, tarefas]);

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

  const handleSave = (taskData) => {
    if (taskData.id) {
      // editar
      setTarefas((current) => current.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t)));
    } else {
      // criar
      const nova = {
        ...taskData,
        id: proximaId,
        status: taskData.status || "pending",
        concluida: taskData.concluida || false,
      };
      setTarefas((current) => [...current, nova]);
      setProximaId((id) => id + 1);
    }
    fecharModal();
  };

  const deletarTarefa = (id) => {
    const tarefasAtualizadas = tarefas.filter((tarefa) => tarefa.id !== id);
    setTarefas(tarefasAtualizadas);
    fecharModal();
  };

  const alternarConcluida = (id, novoStatus) => {
    const tarefasAtualizadas = tarefas.map((tarefa) => {
      if (tarefa.id === id) {
        if (novoStatus) {
          return {
            ...tarefa,
            status: novoStatus,
            concluida: novoStatus === "done",
          };
        }
        return {
          ...tarefa,
          status: tarefa.concluida ? "pending" : "done",
          concluida: !tarefa.concluida,
        };
      }
      return tarefa;
    });
    setTarefas(tarefasAtualizadas);
  };

  return (
    <>
      <Header titulo=" TaskFlow " subtitulo="Gerencie suas tarefas" />
      <main className="container">
        <Kanban
          tarefas={tarefas}
          onAdicionar={abrirCriar}
          onDeletar={deletarTarefa}
          onConcluir={alternarConcluida}
          onEditar={abrirEditar}
        />

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
