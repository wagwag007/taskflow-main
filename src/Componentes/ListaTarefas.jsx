import { useEffect, useMemo, useState } from 'react';
import TarefaItem from './TarefaItem';
import styles from './TarefaItem.module.css';

const COLUMN_LABELS = {
  pending: 'Pendentes',
  inprogress: 'Em Andamento',
  done: 'Concluídas',
};
const COLUMN_ORDER = ['pending', 'inprogress', 'done'];

function ListaTarefas({ tarefas, onDeletar, onConcluir, onEditar }) {
  const [kanbanTasks, setKanbanTasks] = useState([]);

  useEffect(() => {
    setKanbanTasks((previousTasks) => {
      const previousMap = new Map(previousTasks.map((task) => [task.id, task]));
      return tarefas.map((task) => ({
        ...task,
        status:
          previousMap.get(task.id)?.status ??
          (task.concluida ? 'done' : 'pending'),
      }));
    });
  }, [tarefas]);

  const handleStatusChange = (id, status) => {
    const task = kanbanTasks.find((taskItem) => taskItem.id === id);

    setKanbanTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );

    if (!task) {
      return;
    }

    if (status === 'done' && !task.concluida) {
      onConcluir(id);
    } else if (status !== 'done' && task.concluida) {
      onConcluir(id);
    }
  };

  const tasksByColumn = useMemo(() => {
    return COLUMN_ORDER.reduce((accumulator, columnKey) => {
      accumulator[columnKey] = kanbanTasks.filter(
        (task) => task.status === columnKey
      );
      return accumulator;
    }, {});
  }, [kanbanTasks]);

  return (
    <section id='lista-section' className={styles.kanbanSection}>
      <div className={styles.kanbanHeader}>
        <p>Arraste o status da sua tarefa entre Pendentes, Em Andamento e Concluídas.</p>
      </div>

      <div className={styles.kanbanBoard}>
        {COLUMN_ORDER.map((columnKey) => (
          <div key={columnKey} className={styles.column}>
            <header className={styles.columnHeader}>
              <span>{COLUMN_LABELS[columnKey]}</span>
              <span className={styles.columnCount}>
                {tasksByColumn[columnKey].length}
              </span>
            </header>
            <ul className={styles.columnBody}>
              {tasksByColumn[columnKey].length === 0 ? (
                <li className={styles.emptyText}>
                  Nenhuma tarefa nesta coluna.
                </li>
              ) : (
                tasksByColumn[columnKey].map((tarefa) => (
                  <TarefaItem
                    key={tarefa.id}
                    texto={tarefa.texto}
                    concluida={tarefa.concluida}
                    prioridade={tarefa.prioridade}
                    status={tarefa.status}
                    cep={tarefa.cep}
                    cepInfo={tarefa.cepInfo}
                    onDeletar={() => onDeletar(tarefa.id)}
                    onConcluir={() => onConcluir(tarefa.id)}
                    onStatusChange={(newStatus) =>
                      handleStatusChange(tarefa.id, newStatus)
                    }
                    onEditar={() => onEditar && onEditar(tarefa)}
                  />
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
      {tarefas.length === 0 && (
        <p className={styles.msgVazia}>
          Nenhuma tarefa cadastrada. Adicione uma acima!
        </p>
      )}
    </section>
  );
}
export default ListaTarefas;
