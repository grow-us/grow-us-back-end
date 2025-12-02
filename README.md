# 📡 Documentação da API

Esta documentação descreve as principais rotas disponíveis na API, organizadas por módulos.

---

## 🔑 Autenticação

### Rota POST — Cadastro de Funcionário

```bash
https://app-zxlyzt4g3q-uc.a.run.app/cadastro
```


Esta rota é responsável por cadastrar funcionários já existentes na base da empresa.




**Body esperado:**
```json
{
  "email": "usuario@growus.com",
  "nome": "João Victor",
  "perfil": "https://exemplo.com/imagem-perfil.jpg",
  "cargo": "Desenvolvedor Front-end"
}

```


### rota POST de cadastro de eventos

```bash
https://app-zxlyzt4g3q-uc.a.run.app/evento
```


Esta rota é responsável por cadastrar futuros eventos da empresa.





**Body esperado:**
```json
{
  "titulo": "Evento de Tecnologia",
  "localidade": "Recife - PE",
  "dia": "2025-12-15",
  "img": "https://exemplo.com/imagem-evento.png",
  "descricao": "Um evento voltado para networking, inovação e desenvolvimento profissional."
}

```












