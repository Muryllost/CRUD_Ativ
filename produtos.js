document.addEventListener("DOMContentLoaded", loadProdutos);

const botao = document.querySelector("#cadastrar");
botao.addEventListener("click", async function (event) {
  event.preventDefault();

  const nome = document.querySelector("#enunciado").value.trim();
  const preco = document.querySelector("#alternativa_a").value.trim();
  const quantidade_estoque = document
    .querySelector("#alternativa_b")
    .value.trim();
  const descricao = document.querySelector("#descricao").value.trim();
  const categoria = document.querySelector("#alternativa_c").value.trim();

  if (!nome || !preco || !quantidade_estoque || !categoria || !descricao) {
    alert("Todos os campos são obrigatórios");
    return;
  }

  try {
    const res = await fetch("http://192.168.1.115:3000/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        preco,
        descricao,
        quantidade_estoque,
        categoria,
      }),
    });

    const data = await res.json();

    if (res.status === 201) {
      alert("Produto cadastrado com sucesso!");
      await loadProdutos(); // Essa função precisa estar definida em algum lugar
      document.querySelector("form").reset(); // Limpa o formulário após o cadastro
    } else if (res.status === 409) {
      alert(data.message || "Esse produto já existe"); // Ajuste para pegar a mensagem correta do servidor
    } else {
      alert("Erro: " + (data.message || res.status)); // Melhor usar `data.message` se o servidor retornar uma mensagem
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Erro na comunicação com o servidor");
  }
});

//* Carregar produtos
async function loadProdutos() {
  const lista = document.getElementById("produtoList");
  lista.innerHTML = "";

  try {
    const response = await fetch("http://192.168.1.115:3000/api/produtos");
    const produtos = await response.json();

    produtos.forEach((produto) => {
      addProdutoToPage(produto);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

//* Criar card do produto
function addProdutoToPage(produto) {
  const lista = document.getElementById("produtoList");

  const card = document.createElement("div");
  card.classList.add("card");

  const hiddenIdInput = document.createElement("input");
  hiddenIdInput.type = "hidden";
  hiddenIdInput.value = produto.id_produtos;
  hiddenIdInput.classList.add("produto-id");

  const title = document.createElement("h3");
  title.classList.add("card-title");
  title.innerText = `Produto: ${produto.nome}`;

  const details = document.createElement("ul");
  details.classList.add("card-details");
  details.innerHTML = `
    <li>Preço: R$ ${produto.preco}</li>
    <li>Quantidade: ${produto.quantidade_estoque}</li>
    <li>Descrição: ${produto.descricao}</li>
    <li>Categoria: ${produto.categoria}</li>
  `;

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Excluir";
  deleteButton.classList.add("delete-button");
  deleteButton.addEventListener("click", async () => {
    try {
      const response = await fetch(
        `http://192.168.1.115:3000/api/produtos/${produto.id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        alert("Produto excluído");
        card.remove();
      } else {
        alert("Erro ao deletar o produto.");
      }
    } catch (error) {
      console.error("Erro na exclusão:", error);
    }
  });

  const editbutton = document.createElement("button");
  editbutton.innerText = "Editar";
  editbutton.classList.add("edit-button");

  editbutton.addEventListener("click", () => {
    const modal = document.getElementById("modal-editar");

    document.getElementById("edit-nome").value = produto.nome;
    document.getElementById("edit-preco").value = produto.preco;
    document.getElementById("edit-descricao").value = produto.descricao;
    document.getElementById("edit-quantidade").value =
      produto.quantidade_estoque;
    document.getElementById("edit-categoria").value = produto.categoria;

    document
      .getElementById("salvar-edicao")
      .setAttribute("data-id", produto.id);

    modal.showModal();
  });

  card.append(title, hiddenIdInput, details, deleteButton, editbutton);
  lista.appendChild(card);
}

//* Modal edição
document
  .getElementById("salvar-edicao")
  .addEventListener("click", async (event) => {
    const id_produtos = event.target.getAttribute("data-id");

    const atualizacao = {
      nome: document.getElementById("edit-nome").value.trim(),
      preco: document.getElementById("edit-preco").value.trim(),
      descricao: document.getElementById("edit-descricao").value.trim(),
      quantidade: document.getElementById("edit-quantidade").value.trim(),
      categoria: document.getElementById("edit-categoria").value.trim(),
    };

    try {
      const response = await fetch(
        `http://192.168.1.115:3000/api/produtos/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(atualizacao),
        }
      );

      if (response.ok) {
        alert("Produto editado com sucesso!");
        await loadProdutos();
      } else if (response.status === 409) {
        alert("Já existe um produto com esse nome.");
      } else if (response.status === 400) {
        alert("Todos os campos são obrigatórios.");
      } else if (response.status === 404) {
        alert("Produto não encontrado.");
      } else {
        alert("Erro ao editar.");
      }
    } catch (error) {
      console.log("Erro ao Editar", error);
      alert("Erro na comunicação com o servidor.");
    }

    document.getElementById("modal-editar").close();
  });
