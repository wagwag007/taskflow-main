import TarefaItem from './TarefaItem';
import styles from './TarefaItem.module.css';

export default function Kanban({
  tarefas = [],
  onAdicionar,
  onDeletar,
  onConcluir,
  onEditar,
}) {
  const colunas = [
    { id: 'pending', titulo: 'Pendentes' },
    { id: 'inprogress', titulo: 'Em andamento' },
    { id: 'done', titulo: 'Concluídas' },
  ];

  const obterStatus = (tarefa) => {
    if (tarefa.status) return tarefa.status;
    return tarefa.concluida ? 'done' : 'pending';
  };

  return (
    <section className={styles.kanbanSection}>
      <div className={styles.kanbanHeader}>
        <h2>Minhas tarefas</h2>
        <p>Organize suas atividades por etapa.</p>
        <button type="button" className={styles.actionButton} onClick={onAdicionar}>
          Adicionar tarefa
        </button>
      </div>

      <div className={styles.kanbanBoard}>
        {colunas.map((coluna) => {
          const tarefasDaColuna = tarefas.filter(
            (tarefa) => obterStatus(tarefa) === coluna.id
          );

          return (
            <div className={styles.column} key={coluna.id}>
              <div className={styles.columnHeader}>
                <span>{coluna.titulo}</span>
                <span className={styles.columnCount}>{tarefasDaColuna.length}</span>
              </div>
              <ul className={styles.columnBody}>
                {tarefasDaColuna.length === 0 ? (
                  <li className={styles.emptyText}>Nenhuma tarefa aqui.</li>
                ) : (
                  tarefasDaColuna.map((tarefa) => (
                    <TarefaItem
                      key={tarefa.id}
                      {...tarefa}
                      status={obterStatus(tarefa)}
                      onEditar={() => onEditar(tarefa)}
                      onDeletar={() => onDeletar(tarefa.id)}
                      onConcluir={() => onConcluir(tarefa.id)}
                      onStatusChange={(status) => onConcluir(tarefa.id, status)}
                    />
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}