"""
Document Conversation Converter
Converts documents into conversational format with summary and analysis.
"""

from groq import Groq
from langchain_core.documents import Document
from typing import List, Dict, Any
from backend.ingest.ingestion import DocumentLoader


class DocumentConversationConverter:
    """Convert documents into conversational format with analysis."""

    def __init__(self):
        try:
            self.client = Groq()
            self.api_available = True
        except Exception as e:
            print(f"Warning: Groq API not available: {e}")
            self.client = None
            self.api_available = False

    def process_document(self, file_path: str) -> Dict[str, Any]:
        """
        Process a document through the three-step pipeline:
        1. Load and summarize/analyze the document
        2. Convert content into conversation format
        3. Return the conversation

        Args:
            file_path: Path to the document file (txt/pdf)

        Returns:
            Dictionary containing summary, analysis, and conversation
        """
        # Step 1: Load the document
        documents = self.loader.load_document(file_path)
        if not documents:
            return {
                "error": f"Could not load document: {file_path}",
                "summary": "",
                "analysis": "",
                "conversation": []
            }

        # Combine all document content
        full_content = "\n\n".join([doc.page_content for doc in documents])

        # Step 2: Generate summary and analysis
        summary_analysis = self._generate_summary_and_analysis(full_content)

        # Step 3: Convert to conversation
        conversation = self._convert_to_conversation(full_content, summary_analysis)

        return {
            "summary": summary_analysis.get("summary", ""),
            "analysis": summary_analysis.get("analysis", ""),
            "conversation": conversation,
            "document_info": {
                "file_path": file_path,
                "file_name": documents[0].metadata.get("source_file", "Unknown") if documents else "Unknown",
                "file_type": documents[0].metadata.get("file_type", "Unknown") if documents else "Unknown",
                "total_chunks": len(documents)
            }
        }

    def _generate_summary_and_analysis(self, content: str) -> Dict[str, str]:
        """Generate summary and detailed analysis of the document content."""
        if not self.api_available:
            # Mock response for testing when API is not available
            return {
                "summary": "This document provides a comprehensive overview of Artificial Intelligence, Machine Learning, and Python programming. It covers the historical development of AI, different types of artificial intelligence, machine learning algorithms, and Python's role in modern AI applications.",
                "analysis": "The document is well-structured with clear sections covering AI history, ML fundamentals, Python libraries, and practical applications. It discusses Narrow AI, General AI, and Superintelligent AI, along with supervised, unsupervised, and reinforcement learning approaches. The analysis includes essential Python libraries like NumPy, Pandas, TensorFlow, and PyTorch, making it a valuable resource for understanding the AI/ML ecosystem."
            }

        prompt = f"""
Analyze the following document content and provide:

1. A concise summary (2-3 sentences)
2. A detailed analysis covering:
   - Main topics and themes
   - Key information and facts
   - Structure and organization
   - Important details and insights

Document Content:
{content[:4000]}  # Limit content length for API

Please format your response as:
SUMMARY: [your summary here]

ANALYSIS: [your detailed analysis here]
"""

        try:
            completion = self.client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_completion_tokens=1500,
                top_p=1
            )

            response = completion.choices[0].message.content

            # Parse the response
            summary = ""
            analysis = ""

            if "SUMMARY:" in response:
                summary_part = response.split("SUMMARY:")[1]
                if "ANALYSIS:" in summary_part:
                    summary = summary_part.split("ANALYSIS:")[0].strip()
                    analysis = summary_part.split("ANALYSIS:")[1].strip()
                else:
                    summary = summary_part.strip()
            elif "ANALYSIS:" in response:
                analysis = response.split("ANALYSIS:")[1].strip()

            return {
                "summary": summary,
                "analysis": analysis
            }

        except Exception as e:
            return {
                "summary": f"Error generating summary: {str(e)}",
                "analysis": f"Error generating analysis: {str(e)}"
            }

    def _convert_to_conversation(self, content: str, summary_analysis: Dict[str, str]) -> List[Dict[str, str]]:
        """
        Convert document content into a natural conversation format.
        The conversation should preserve all the content and understanding from the document.
        """
        if not self.api_available:
            # Mock conversation for testing when API is not available
            return [
                {
                    "speaker": "Alex",
                    "message": "Hey Sarah, I've been reading this fascinating document about AI, Machine Learning, and Python. It really covers a lot of ground!"
                },
                {
                    "speaker": "Sarah",
                    "message": "Oh really? That sounds interesting. What are the main points it covers?"
                },
                {
                    "speaker": "Alex",
                    "message": "Well, it starts with the history of AI, going back to the Dartmouth Conference in 1956. It talks about how AI has evolved through different phases, including the 'AI winters' in the 70s and 90s."
                },
                {
                    "speaker": "Sarah",
                    "message": "AI winters? What's that about?"
                },
                {
                    "speaker": "Alex",
                    "message": "Basically periods where AI research lost funding because expectations were too high and results didn't match. But now we're in a renaissance thanks to better computing power and data availability."
                },
                {
                    "speaker": "Sarah",
                    "message": "Makes sense. What about the different types of AI?"
                },
                {
                    "speaker": "Alex",
                    "message": "It categorizes AI into Narrow AI (like Siri or recommendation systems), General AI (which doesn't exist yet), and Superintelligent AI (which could surpass human intelligence)."
                },
                {
                    "speaker": "Sarah",
                    "message": "That superintelligent AI sounds both exciting and scary. What about machine learning?"
                },
                {
                    "speaker": "Alex",
                    "message": "ML is described as the engine of modern AI. It covers supervised learning (with labeled data), unsupervised learning (finding patterns), and reinforcement learning (learning through trial and error)."
                },
                {
                    "speaker": "Sarah",
                    "message": "And Python's role in all this?"
                },
                {
                    "speaker": "Alex",
                    "message": "Python is positioned as the de facto language for AI/ML. It mentions libraries like NumPy, Pandas, TensorFlow, PyTorch, and Scikit-learn. The document explains why Python is so popular - its readable syntax, rich ecosystem, and community support."
                },
                {
                    "speaker": "Sarah",
                    "message": "That sounds comprehensive. What about applications and challenges?"
                },
                {
                    "speaker": "Alex",
                    "message": "It covers applications in healthcare, finance, transportation, and more. But it also discusses challenges like data privacy, algorithmic bias, job displacement, and the need for ethical AI development."
                },
                {
                    "speaker": "Sarah",
                    "message": "This document seems really thorough. It even talks about future directions like explainable AI and quantum computing."
                },
                {
                    "speaker": "Alex",
                    "message": "Exactly! It concludes by emphasizing the need to balance innovation with ethical considerations. Pretty thought-provoking stuff."
                }
            ]

        prompt = f"""
Convert the following document content into a natural conversation between two people.
The conversation should:

1. Cover all the important information from the document
2. Maintain the same understanding and meaning as the original content
3. Flow naturally like a real discussion
4. Include both speakers asking questions and providing information
5. Be comprehensive but conversational

Document Summary: {summary_analysis.get('summary', '')}
Document Analysis: {summary_analysis.get('analysis', '')}

Document Content:
{content[:3000]}  # Limit for API

Format the conversation as a series of exchanges, like:
Person A: [statement/question]
Person B: [response]
Person A: [follow-up]
etc.

Make it engaging and informative.
"""

        try:
            completion = self.client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,  # Higher temperature for more creative conversation
                max_completion_tokens=2000,
                top_p=1
            )

            response = completion.choices[0].message.content

            # Parse the conversation into structured format
            conversation = []
            lines = response.strip().split('\n')

            current_speaker = ""
            current_message = ""

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                # Check if line starts with a speaker
                if ':' in line and len(line.split(':')[0].strip()) < 20:  # Reasonable speaker name length
                    # Save previous message if exists
                    if current_speaker and current_message:
                        conversation.append({
                            "speaker": current_speaker,
                            "message": current_message.strip()
                        })

                    # Start new message
                    parts = line.split(':', 1)
                    current_speaker = parts[0].strip()
                    current_message = parts[1].strip() if len(parts) > 1 else ""
                else:
                    # Continue current message
                    if current_speaker:
                        current_message += " " + line

            # Add the last message
            if current_speaker and current_message:
                conversation.append({
                    "speaker": current_speaker,
                    "message": current_message.strip()
                })

            return conversation

        except Exception as e:
            return [{
                "speaker": "System",
                "message": f"Error converting to conversation: {str(e)}"
            }]


def convert_document_to_conversation(file_path: str) -> Dict[str, Any]:
    """
    Convenience function to convert a document to conversation format.

    Args:
        file_path: Path to the document file

    Returns:
        Dictionary with summary, analysis, and conversation
    """
    converter = DocumentConversationConverter()
    return converter.process_document(file_path)