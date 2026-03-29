import os
import json
from dotenv import load_dotenv
from groq import Groq

# Încărcăm variabilele de mediu din fișierul .env (asigură-te că ai GROQ_API_KEY acolo)
load_dotenv()

# Inițializăm clientul Groq (va folosi automat os.environ.get("GROQ_API_KEY"))
# Dacă nu e setată cheia, va arunca o eroare clară.
try:
    client = Groq()
except Exception as e:
    print("\n[!] EROARE: Cheia GROQ_API_KEY nu a fost găsită!")
    print("Te rugăm să adaugi GROQ_API_KEY=cheia_ta_aici în fișierul backend/.env")
    exit(1)

SYSTEM_PROMPT = """
Sunteți asistentul virtual inteligent al librăriei BookIo.
Rolul tău exclusiv este să oferi recomandări de cărți, informații despre autori, literatură și detalii despre magazinul nostru de cărți, BookIo.

REGULI STRICTE (GUARDRAILS):
1. Răspunde exclusiv la întrebări legate de cărți, literatură, scriitori sau magazinul BookIo.
2. Dacă utilizatorul te întreabă despre ORICE alt subiect (politică, sport, programare tehnică, economie, vreme, etc.), TREBUIE să refuzi politicos și să readuci discuția la cărți. 
   - Exemplu obligatoriu de refuz: "Îmi pare rău, dar sunt un asistent dedicat exclusiv literaturii și magazinului BookIo. Cu ce carte sau autor te pot ajuta astăzi?"
3. Fii politicos, prietenos și extrem de concis. Nu oferi răspunsuri kilometrice.
4. Dacă utilizatorul își exprimă dorința clară de a CUMPĂRA, a COMANDA sau de a ADĂUGA ÎN COȘ o anumită carte, apelează funcția `add_to_cart`.
"""

# Definim array-ul de "tools" (unelte)
# Acestea dictează formatul JSON pe care Groq îl va genera când utilizatorul cere "Adaugă în coș"
tools = [
    {
        "type": "function",
        "function": {
            "name": "add_to_cart",
            "description": "Adaugă o carte specifică în coșul de cumpărături al utilizatorului. Apelează DOAR dacă utilizatorul cere expres să cumpere o carte.",
            "parameters": {
                "type": "object",
                "properties": {
                    "book_id": {
                        "type": "string",
                        "description": "Titlul cărții, autorul sau ID-ul exact pe care utilizatorul vrea să îl cumpere."
                    },
                    "quantity": {
                        "type": "integer",
                        "description": "Numărul de exemplare (default 1)."
                    }
                },
                "required": ["book_id"]
            }
        }
    }
]

def chat_with_books_assistant(user_message: str, conversation_history: list = None):
    if conversation_history is None:
        conversation_history = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
    
    # Adăugăm mesajul utilizatorului la istoric
    conversation_history.append({"role": "user", "content": user_message})

    try:
        # Apelăm modelul Groq LLaMA 3 (8 miliarde de parametri, ultra-rapid)
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=conversation_history,
            tools=tools,
            tool_choice="auto",
            max_tokens=800,
            temperature=0.3 # temperatură joasă pentru ca modelul să respecte cu strictețe guardrails-urile
        )

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        # Verificăm dacă modelul a decis să apeleze funcția "add_to_cart"
        if tool_calls:
            for tool_call in tool_calls:
                if tool_call.function.name == "add_to_cart":
                    # Preluăm argumentele (JSON string) generate complet automat de Llama 3
                    function_args = json.loads(tool_call.function.arguments)
                    
                    # Acest dicționar poate fi trimis către Express.js și mai departe către React
                    return {
                        "type": "ACTION",
                        "action_name": "ADD_TO_CART",
                        "payload": function_args,
                        "reply": f"Acționăm imediat! Pregătim '{function_args.get('book_id')}' pentru a fi adăugată în coș..."
                    }
        else:
            # Modelul a dat un răspuns text normal
            conversation_history.append({"role": "assistant", "content": response_message.content})
            return {
                "type": "TEXT",
                "reply": response_message.content,
                "history": conversation_history
            }

    except Exception as e:
         return {
             "type": "ERROR",
             "reply": f"A apărut o eroare la API-ul Groq: {str(e)}"
         }

if __name__ == "__main__":
    print("="*60)
    print("🤖 Bun venit la testarea Chatbot-ului BookIo (powered by Groq)")
    print("=============================================================")
    print("Testează regulile! Întreabă-mă despre fotbal, apoi despre o carte.")
    print("Testează coșul! Spune \"Vreau să cumpăr Micul Prinț\"")
    print("Scrie 'iesire' sau 'exit' pentru a opri.")
    print("="*60)
    
    chat_history = None

    while True:
        try:
            user_input = input("\n[Tu]: ")
            if user_input.lower() in ["exit", "iesire", "quit", "stop", "gata"]:
                print("La revedere!")
                break
                
            if not user_input.strip():
                continue

            result = chat_with_books_assistant(user_input, chat_history)

            if result["type"] == "TEXT":
                print(f"\n[BookIo AI]: {result['reply']}")
                # Menținem starea discuției
                chat_history = result["history"]
                
            elif result["type"] == "ACTION":
                print(f"\n[BookIo AI]: {result['reply']}")
                print("-" * 40)
                print("JSON generat de AI (va fi trimis spre Frontend - setCos):")
                print(json.dumps(result["payload"], indent=2, ensure_ascii=False))
                print("-" * 40)
                
            elif result["type"] == "ERROR":
                print(f"\n[!] Eroare de sistem: {result['reply']}")
                
        except KeyboardInterrupt:
            print("\nIeșire forțată.")
            break
