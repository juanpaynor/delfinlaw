import ChatAssistant from './chat-assistant';

export default function AiAssistantSection() {
  return (
    <section id="ai-assistant" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="font-headline text-4xl md:text-5xl font-bold">AI-Powered Legal Assistant</h2>
            <p className="text-lg text-muted-foreground">
              Have a general legal question? Our AI assistant can provide preliminary information and guide you to the right resources.
            </p>
            <p className="text-sm text-muted-foreground/80">
              <span className="font-semibold">Disclaimer:</span> This tool provides general information for educational purposes and is not a substitute for professional legal advice. An attorney-client relationship is not formed by using this tool.
            </p>
          </div>
          <div className="bg-background rounded-lg border border-border/50 p-4 md:p-6 shadow-lg">
            <ChatAssistant />
          </div>
        </div>
      </div>
    </section>
  );
}
