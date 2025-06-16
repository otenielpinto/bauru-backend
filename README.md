# bauru-backend

Sistema de gestão de preços de custo integrado ao Tiny ERP

## Descrição

Este projeto é um sistema de gestão de preços de custo que se integra com o [Tiny ERP](https://tiny.com.br/api-docs/api). O sistema calcula automaticamente os preços de custo dos produtos com base na composição de matéria-prima, proporcionando maior precisão e controle sobre a formação de preços.

A solução permite que empresas tenham uma visão detalhada dos custos reais de produção, considerando todos os componentes utilizados na fabricação de cada produto, desde matérias-primas até insumos auxiliares.

### Funcionalidades Principais

- **Gestão de Composição de Produtos:** Cadastro e controle detalhado das matérias-primas utilizadas em cada produto
- **Cálculo Automático de Custos:** Determinação precisa do custo de produção baseado na composição atual de materiais
- **Integração com Tiny ERP:** Sincronização automática de dados de produtos, fornecedores e custos
- **Atualização de Preços em Tempo Real:** Recálculo automático quando há alterações nos preços das matérias-primas
- **Relatórios de Custos:** Análises detalhadas da composição de custos por produto

### Tecnologias Utilizadas

- **Node.js:** Backend robusto para processamento de cálculos de custos e integração com APIs
- **Axios:** Cliente HTTP para comunicação com a API do Tiny ERP
- **Autenticação JWT:** Segurança nas comunicações entre sistemas
- **MongoDB:** Armazenamento de dados de composição, histórico de preços e logs de operações

### Benefícios

- **Precisão nos Custos:** Cálculos baseados na composição real dos produtos eliminam estimativas imprecisas
- **Otimização de Margens:** Melhor controle sobre rentabilidade através de custos precisos
- **Automação de Processos:** Redução significativa do trabalho manual na gestão de preços
- **Rastreabilidade:** Histórico completo de alterações de custos e suas causas
- **Tomada de Decisão Informada:** Dados confiáveis para estratégias de precificação

### Referências

## [Tiny API](https://tiny.com.br/api-docs/api),

Este projeto é mantido ativamente e acolhe contribuições para melhorar sua funcionalidade e cobertura.
