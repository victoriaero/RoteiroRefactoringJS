const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valor / 100);
}

function getPeca(pecas, apre) {
  return pecas[apre.id];
}

function calcularCredito(pecas, apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(pecas, apre).tipo === "comedia")
    creditos += Math.floor(apre.audiencia / 5);
  return creditos;
}

function calcularTotalCreditos(pecas, apresentacoes) {
  let total = 0;
  for (let apre of apresentacoes) {
    total += calcularCredito(pecas, apre);
  }
  return total;
}

function calcularTotalApresentacao(pecas, apre) {
  const peca = getPeca(pecas, apre);
  let total = 0;
  switch (peca.tipo) {
    case "tragedia":
      total = 40000 + Math.max(apre.audiencia - 30, 0) * 1000;
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
        total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
      throw new Error(`Peça desconhecia: ${peca.tipo}`);
  }
  return total;
}

function calcularTotalFatura(pecas, apresentacoes) {
  let total = 0;
  for (let apre of apresentacoes) {
    total += calcularTotalApresentacao(pecas, apre);
  }
  return total;
}

function gerarFaturaStr(fatura, pecas) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    // mais uma linha da fatura
    faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(
      calcularTotalApresentacao(pecas, apre)
    )} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(
    calcularTotalFatura(pecas, fatura.apresentacoes)
  )}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(
    pecas,
    fatura.apresentacoes
  )} \n`;
  return faturaStr;
}

function gerarFaturaHTML(fatura, pecas) {
  let html = "<html>\n";
  html += `<p> Fatura ${fatura.cliente} </p>\n`;
  html += "<ul>\n";
  for (let apre of fatura.apresentacoes) {
    html += `<li>  ${getPeca(pecas, apre).nome}: ${formatarMoeda(
      calcularTotalApresentacao(pecas, apre)
    )} (${apre.audiencia} assentos) </li>\n`;
  }
  html += "</ul>\n";
  html += `<p> Valor total: ${formatarMoeda(
    calcularTotalFatura(pecas, fatura.apresentacoes)
  )} </p>\n`;
  html += `<p> Créditos acumulados: ${calcularTotalCreditos(
    pecas,
    fatura.apresentacoes
  )} </p>\n`;
  html += "</html>";
  return html;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
console.log(gerarFaturaStr(faturas, pecas));
console.log(gerarFaturaHTML(faturas, pecas));
