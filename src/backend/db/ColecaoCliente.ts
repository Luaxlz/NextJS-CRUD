import firebase from "../config";
import Cliente from "../../core/Cliente";
import ClienteRepositorio from "../../core/ClienteRepositorio";

export default class ColecaoCliente implements ClienteRepositorio {
    
    #conversor = {
        toFirestore(cliente: Cliente) {
            return {
                nome: cliente.nome,
                idade: cliente.idade,
            }
        },
        fromFirestore(snapshot: firebase.firestore.QueryDocumentSnapshot, options: firebase.firestore.SnapshotOptions): Cliente {
            const dados = snapshot.data(options)
            return new Cliente(dados.nome, dados.idade, snapshot?.id)
        }
    }

    async salvar(cliente: Cliente): Promise<Cliente> {
        if(cliente?.id) {
            //Se o cliente estiver setado iremos alterar:
            await this.colecao().doc(cliente.id).set(cliente)
            return cliente
        } else {
            //Cliente nao existe, iremos salvar um novo cliente:
            const docRef = await this.colecao().add(cliente)
            const doc = await docRef.get()
            return doc.data()
        }
    }

    async excluir(cliente: Cliente): Promise<void> {
        return this.colecao().doc(cliente.id).delete()
    }

    async obterTodos(): Promise<Cliente[]> {
        const query = await this.colecao().get() //Busca no banco todos os clientes
        return query.docs.map(doc => doc.data()) ?? [] //Pega todos os documento e faz um mapeamento para doc.data que retorna os clientes, caso nao exista retorna um array vazio 
    }

    private colecao() {
        return firebase.firestore()
            .collection('clientes')
            .withConverter(this.#conversor)
    }
}