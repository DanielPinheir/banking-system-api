let {
  lerArquivoConverterParaArrayJavaScript,
  converteArrayParaTextoEEscreveNoArquivo,
  caminhoArquivoBancoDeDados,
} = require("../utils/manipularDadosJson");

const {
  contaSelecionadaPeloNumero,
} = require("../utils/selecinarContaPeloNumero");

let bancoDeDados = lerArquivoConverterParaArrayJavaScript(
  caminhoArquivoBancoDeDados
);

//GET
const listarContas = async (req, res) => {
  let dados = await bancoDeDados;

  if (dados.contas.length === 0) {
    return res.status(400).json({
      mensagem: "Não existem contas cadastradas",
    });
  }
  res.status(200).json(dados.contas);
};

const saldoDaConta = async (req, res) => {
  const { numero_conta } = req.query;

  try {
    const contaSelecionada = await contaSelecionadaPeloNumero(numero_conta);

    return res.status(200).json({
      saldo: Number(contaSelecionada.saldo),
    });
  } catch (error) {
    return res.status(404).json({
      mensagem: `Erro ${error.message} ao consultar o saldo.`,
    });
  }
};

const extratoDaConta = async (req, res) => {
  const { numero_conta } = req.query;

  try {
    let dados = await bancoDeDados;

    const depositosDaConta = dados.depositos.filter(
      (deposito) => Number(deposito.numero_conta) === Number(numero_conta)
    );

    const saquesDaConta = dados.saques.filter(
      (saque) => Number(saque.numero_conta) === Number(numero_conta)
    );

    const transferenciasEnviadasDaConta = dados.transferencias.filter(
      (transferenciaEnviada) =>
        Number(transferenciaEnviada.numero_conta_origem) ===
        Number(numero_conta)
    );

    const transferenciasRecebidasNaConta = dados.transferencias.filter(
      (transferenciaRecebida) =>
        Number(transferenciaRecebida.numero_conta_destino) ===
        Number(numero_conta)
    );

    const extratoDaConta = {
      depositos: depositosDaConta,
      saques: saquesDaConta,
      transferenciasEnviadas: transferenciasEnviadasDaConta,
      transferenciasRecebidas: transferenciasRecebidasNaConta,
    };

    return res.status(200).json(extratoDaConta);
  } catch (error) {
    return res.status(404).json({
      mensagem: `Erro ${error.message} ao consultar o extrato.`,
    });
  }
};

//POST
const cadastrarConta = async (req, res) => {
  try {
    let dados = await bancoDeDados;

    let ultimoNumeroConta = 1;

    if (dados.contas.length > 0) {
      const ultimoIndice = dados.contas.length - 1;
      ultimoNumeroConta = Number(dados.contas[ultimoIndice].numero) + 1;
    }

    const contaCadastrada = {
      numero: ultimoNumeroConta,
      saldo: 0,
      usuario: { ...req.body },
    };

    dados.contas.push(contaCadastrada);

    await converteArrayParaTextoEEscreveNoArquivo(
      caminhoArquivoBancoDeDados,
      dados
    );
    return res.status(201).json(contaCadastrada);
  } catch (error) {
    return res.status(404).json({
      mensagem: `Erro ${error.message} ao cadastrar a conta.`,
    });
  }
};

//PUT
const atualizarConta = async (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  const { numeroConta } = req.params;

  if (!nome && !cpf && !data_nascimento && !telefone && !email && !senha) {
    return res.status(400).json({
      mensagem:
        "É obrigatório informar ao menos um campo para atualização na corpo da requisição.",
    });
  }

  try {
    let dados = await bancoDeDados;

    const contaSelecionada = await contaSelecionadaPeloNumero(numeroConta);

    const indexContaSelecionada = dados.contas.findIndex(
      (conta) => Number(conta.numero) === Number(numeroConta)
    );

    if (nome) {
      contaSelecionada.usuario.nome = nome;
    }
    if (cpf) {
      contaSelecionada.usuario.cpf = cpf;
    }
    if (data_nascimento) {
      contaSelecionada.usuario.data_nascimento = data_nascimento;
    }
    if (telefone) {
      contaSelecionada.usuario.telefone = telefone;
    }
    if (email) {
      contaSelecionada.usuario.email = email;
    }
    if (senha) {
      contaSelecionada.usuario.senha = senha;
    }

    dados.contas.splice(indexContaSelecionada, 1, contaSelecionada);

    await converteArrayParaTextoEEscreveNoArquivo(
      caminhoArquivoBancoDeDados,
      dados
    );

    return res.status(200).json({
      mensagem: "Conta atualizada com sucesso!",
    });
  } catch (error) {
    return res
      .status(404)
      .json({ mensagem: `Erro ${error.message} ao atualizar a conta.` });
  }
};

//DELETE
const deletarConta = async (req, res) => {
  const { numeroConta } = req.params;

  try {
    let dados = await bancoDeDados;

    let contaSelecionada = await contaSelecionadaPeloNumero(numeroConta);

    if (contaSelecionada.saldo > 0) {
      return res
        .status(400)
        .json({ mensagem: "Conta não pode ser excluida pois contém saldo." });
    }

    const contasMenosContaSelecionada = dados.contas.filter(
      (conta) => Number(conta.numero) !== Number(numeroConta)
    );

    dados.contas = contasMenosContaSelecionada;

    await converteArrayParaTextoEEscreveNoArquivo(
      caminhoArquivoBancoDeDados,
      dados
    );

    return res.status(200).json({
      mensagem: "Conta excluída com sucesso!",
    });
  } catch (error) {
    return res
      .status(404)
      .json({ mensagem: `Error: ${error.message} ao deletar a conta.` });
  }
};

module.exports = {
  listarContas,
  cadastrarConta,
  atualizarConta,
  deletarConta,
  saldoDaConta,
  extratoDaConta,
};
