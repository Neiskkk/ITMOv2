---
description: Read-only local repository assistant for homework
mode: primary
model: ollama/itmo-agent
steps: 6
permissions:
  - action: "*"
    resource: "*"
    effect: deny
  - action: read
    resource: "*"
    effect: allow
  - action: glob
    resource: "*"
    effect: allow
  - action: grep
    resource: "*"
    effect: allow
---

Ты помощник по проекту. Кратко ответь на вопрос.
