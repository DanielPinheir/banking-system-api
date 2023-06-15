let {
  lerArquivoConverterParaArrayJavaScript,
  caminhoArquivoBancoDeDados,
} = require("../utils/manipularDadosJson");

let {
  contaSelecionadaPeloNumero,
} = require("../utils/selecinarContaPeloNumero");

let bancoDeDados = lerArquivoConverterParaArrayJavaScript(
  caminhoArquivoBancoDeDados
);

const validarCamposObrigatoriosContasBody = (req, res, next) => {
  let { nome, cpf, email, data_nascimento, telefone, senha } = req.body;

  if (!nome) {
    return res.status(404).json({
      mensagem: "Informe o nome do cliente.",
    });
  }

  if (!email) {
    return res.status(400).json({
      mensagem: "Informe o e-mail do cliente.",
    });
  }

  if (!cpf) {
    return res.status(400).json({
      mensagem: "Informe o cpf do cliente.",
    });
  }

  if (!data_nascimento) {
    return res.status(400).json({
      mensagem: "Informe a data de nascimento do cliente.",
    });
  }

  if (!telefone) {
    return res.status(400).json({
      mensagem: "Informe o telefone do cliente.",
    });
  }

  if (!senha) {
    return res.status(400).json({
      mensagem: "Informe a senha do cliente.",
    });
  }
  next();
};

const validarContaEncontradaParam = async (req, res, next) => {
  const { numeroConta } = req.params;

  const contaSelecionada = await contaSelecionadaPeloNumero(numeroConta);

  if (!contaSelecionada) {
    return res.status(400).json({ mensagem: "Conta não encontrada." });
  }

  next();
};

const validarExclusividadeCpfEmailBody = async (req, res, next) => {
  const { cpf, email } = req.body;

  const dados = await bancoDeDados;

  const cpfSelecionado = dados.contas.filter(
    (conta) => String(conta.usuario.cpf) === String(cpf)
  );

  if (cpfSelecionado.length > 0) {
    return res.status(400).json({
      mensagem: "Já existe usuário com este CPF.",
    });
  }

  const emailSelecionado = dados.contas.filter(
    (conta) => String(conta.usuario.email) === String(email)
  );

  if (emailSelecionado.length > 0) {
    return res.status(400).json({
      mensagem: "Já existe usuário com este email.",
    });
  }
  next();
};

const validarSenhaBancoQuery = async (req, res, next) => {
  const { senha_banco } = req.query;

  if (!senha_banco) {
    return res.status(400).json({
      mensagem: "Informe a senha do banco.",
    });
  }

  const dados = await bancoDeDados;

  const contaSelecionada = dados.banco.senha === senha_banco;

  if (!contaSelecionada) {
    return res.status(400).json({
      mensagem: "Senha do banco incorreta.",
    });
  }
  next();
};

const validarContaESenhaQuery = async (req, res, next) => {
  const { numero_conta, senha } = req.query;

  if (!numero_conta) {
    return res.status(400).json({
      mensagem: "Número da conta não informado no parâmetro da url.",
    });
  }

  if (!senha) {
    return res.status(400).json({
      mensagem: "Número da senha não informado no parâmetro da url.",
    });
  }

  const contaSelecionada = await contaSelecionadaPeloNumero(numero_conta);

  if (!contaSelecionada) {
    return res.status(400).json({
      mensagem: "Conta não encontrada.",
    });
  }

  const validacaoSenha =
    String(contaSelecionada.usuario.senha) === String(senha);

  if (!validacaoSenha) {
    return res.status(400).json({ mensagem: "Senha inválida." });
  }

  next();
};

module.exports = {
  validarCamposObrigatoriosContasBody,
  validarContaEncontradaParam,
  validarExclusividadeCpfEmailBody,
  validarSenhaBancoQuery,
  validarContaESenhaQuery,
};
