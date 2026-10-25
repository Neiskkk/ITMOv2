import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const animalIds = new Set(["busya", "martin", "luna", "archie", "sonya", "peach"]);

export function validateApplication(input) {
  const errors = {};
  const name = input.name.trim();
  const phone = (input.phone ?? "").trim();
  const email = (input.email ?? "").trim();
  const comment = input.comment ?? "";

  if (!animalIds.has(input.animalId)) {
    errors.animalId = "Выбран неизвестный питомец";
  }

  if (name.length < 2 || name.length > 60) {
    errors.name = "Имя должно содержать от 2 до 60 символов";
  }

  if (!phone && !email) {
    errors.contact = "Укажите телефон или email";
  }

  if (phone) {
    const allowedPhone = /^[+\d\s()-]+$/u.test(phone);
    const digitCount = (phone.match(/\d/g) ?? []).length;
    if (!allowedPhone || digitCount < 10) {
      errors.phone = "Телефон должен содержать допустимые символы и не менее 10 цифр";
    }
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    errors.email = "Некорректный email";
  }

  if (comment.length > 500) {
    errors.comment = "Комментарий не должен превышать 500 символов";
  }

  if (input.consent !== true) {
    errors.consent = "Необходимо согласие на обработку данных";
  }

  return {
    valid: Object.keys(errors).length === 0,
    animalId: input.animalId,
    errors,
  };
}

function createServer() {
  const server = new McpServer({
    name: "shelter-tools",
    version: "1.0.0",
  });

  server.registerTool(
    "validate_application",
    {
      title: "Validate shelter application",
      description: "Validate an animal shelter application against practice_04 requirements.",
      inputSchema: z.object({
        animalId: z.string().describe("Animal identifier from the shelter catalog"),
        name: z.string().describe("Applicant name"),
        phone: z.string().optional().describe("Applicant phone number"),
        email: z.string().optional().describe("Applicant email"),
        comment: z.string().optional().describe("Optional application comment"),
        consent: z.boolean().describe("Consent to personal data processing"),
      }),
    },
    async (input) => {
      const result = validateApplication(input);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
        isError: !result.valid,
      };
    },
  );

  return server;
}

serveStdio(createServer);
console.error("shelter-tools MCP server is listening on stdio");
