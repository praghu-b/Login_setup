import os
import json
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from .mongodb import admins_collection
from rest_framework.decorators import api_view
import requests



# Set up your Google API Key
os.environ["GOOGLE_API_KEY"] = "AIzaSyDdgepmfxfPW6V5SEUJWDh29L9DthXPhkE"
api_url = "https://1b76-103-196-28-98.ngrok-free.app/generate"

# Initialize the Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GenerateSyllabusView(APIView):
    def post(self, request):
        # Extract inputs from the request
        course_name = request.data.get("course_name")
        domain = request.data.get("domain")
        level = request.data.get("level")
        tone = request.data.get("tone")
        duration = request.data.get("duration")
        num_modules = request.data.get("num_modules")
        manual_input = request.data.get("manual_input", False)

        if not all([course_name, domain, level, tone, duration, num_modules]):
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if manual_input:
            modules = request.data.get("modules")
            if not modules:
                return Response(
                    {"error": "Modules data is required for manual input."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            syllabus_json = {
                "course_name": course_name,
                "domain": domain,
                "level": level,
                "duration": duration,
                "modules": modules,
            }
            return Response({"syllabus": syllabus_json}, status=status.HTTP_200_OK)

        # Adjusted prompt to ensure proper JSON formatting without markdown or escape characters
        prompt = f"""
Act as an expert curriculum designer and generate a detailed syllabus for a course.

Course Details:
- Course Name: {course_name}
- Domain: {domain}
- Level: {level}
- Tone: {tone}
- Duration: {duration}
- No. of Modules: {num_modules}

The syllabus should be returned as a clean JSON object with the following structure:

{{
  "course_name": "{course_name}",
  "domain": "{domain}",
  "level": "{level}",
  "duration": "{duration}",
  "modules": [
    {{
      "module_id": 1,
      "title": "Module 1: <Module Title>",
      "submodules": [
        {{
          "submodule_id": 1.1,
          "title": "<Submodule Title>"
        }},
        {{
          "submodule_id": 1.2,
          "title": "<Submodule Title>"
        }}
      ]
    }},
    {{
      "module_id": 2,
      "title": "Module 2: <Module Title>",
      "submodules": [
        {{
          "submodule_id": 2.1,
          "title": "<Submodule Title>"
        }},
        {{
          "submodule_id": 2.2,
          "title": "<Submodule Title>"
        }}
      ]
    }}
    // Add as many modules as required based on the No. of Modules
  ]
}}

Guidelines:
1. Each module must have a unique `module_id` and a descriptive title.
2. Each submodule must have a unique `submodule_id` nested under its respective module.
3. Use a clean JSON structure with no additional text, markdown, or escape characters like `\\n` or `\\t`.
4. Ensure that the response is precise, well-structured, and easy to parse.
5. Include all necessary details for a comprehensive syllabus.
6. The syllabus response should be generated based on the provided course details.
7. The response structure should be consistent with the provided template.
8. It should not be in markdown format or contain any escape characters.
9. It must be a clean JSON object with the specified keys and values.
10. It should be in a professional way syllabus should be generated like it should have an introduction and end with a conclusion.
11. The modules should be 5 or more or depend on its course name, duration, and level, domain based on that it should generate modules as well.
12. Submodules can vary based on each module so not limited as the example given.
"""

        try:
            # Set up the prompt and chain
            prompt_template = ChatPromptTemplate.from_messages(
                [
                    ("system", "You are a helpful assistant that generates a syllabus."),
                    ("human", "{prompt}"),
                ]
            )
            chain = prompt_template | llm

            # Invoke the chain with the prompt
            response = chain.invoke({"prompt": prompt})

            # Extract the text content from the AIMessage object
            response_text = response.content

            # Log the raw response for debugging
            logger.info(f"Raw response from LLM: {response_text}")

            # Strip the ```json marker if present
            if response_text.startswith("```json") and response_text.endswith("```"):
                response_text = response_text[len("```json"): -len("```")].strip()

            # Parse the response to ensure it is a clean JSON object
            syllabus_json = json.loads(response_text)

            # Ensure the response is directly parsed and returned as a clean JSON object
            return Response({"syllabus": syllabus_json}, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            logger.error(f"JSONDecodeError: The response could not be parsed as JSON. Raw response: {response_text}")
            return Response(
                {"error": "The response could not be parsed as JSON."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class UpdateSyllabusView(APIView):
    def post(self, request):
        # Extract the updated syllabus from the request
        updated_syllabus = request.data.get("syllabus")

        if not updated_syllabus:
            return Response(
                {"error": "Syllabus data is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Here you can add logic to save the updated syllabus to your database or any other storage
            # For now, we'll just return the updated syllabus
            return Response({"syllabus": updated_syllabus}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        

@api_view(['POST'])
def save_syllabus(request):
    try:
        syllabus = request.data.get('syllabus')
        admin_id = request.data.get('id')
        admins_collection.update_one(
            {"admin_id": admin_id},
            {"$set": {"syllabus": syllabus}},
            upsert=True
        )
        return Response({"message": "Syllabus saved successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"An error occurred while saving the syllabus: {str(e)}")
        return Response(
            {"error": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

class GenerateContentView(APIView):
    def post(self, request):
        # Extract the syllabus from the request
        syllabus = request.data.get("syllabus")

        if not syllabus:
            return Response(
                {"error": "Syllabus data is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content_prompt = """
Act as an expert instructor and generate detailed content for the following module and submodules. The content should be comprehensive and structured like a lecture, including explanations, examples, and key points.

Module: {module_title}
Submodules:
{submodules}

Guidelines:
1. Provide a detailed introduction to the module.
2. For each submodule, provide a thorough explanation, including key concepts, examples, and practical applications.
3. Use clear and concise language suitable for {level} students.
4. Ensure the content is well-structured and easy to follow.
5. Do not include any markup symbols or HTML tags in the content.
6. The content should be engaging and informative, as if you are teaching the topic to students.

Output the content in a clean JSON format with the following structure:

{{
  "module_content": "<Detailed content for the module>",
  "submodules_content": [
    {{
      "submodule_id": <submodule_id>,
      "content": "<Detailed content for the submodule>"
    }},
    // Add as many submodules as required.
  ]
}}
"""

        try:
            # Generate content for each module and submodule
            content = {}
            for module in syllabus["modules"]:
                module_title = module["title"]
                submodules = "\n".join([f"{submodule['submodule_id']}: {submodule['title']}" for submodule in module["submodules"]])
                prompt = content_prompt.format(module_title=module_title, submodules=submodules, level=syllabus["level"])

                # Set up the prompt and chain
                prompt_template = ChatPromptTemplate.from_messages(
                    [
                        ("system", "You are a helpful assistant that generates detailed content for modules and submodules."),
                        ("human", "{prompt}"),
                    ]
                )
                chain = prompt_template | llm

                # Invoke the chain with the prompt
                response = chain.invoke({"prompt": prompt})

                # Extract the text content from the AIMessage object
                response_text = response.content

                # Log the raw response for debugging
                logger.info(f"Raw response from LLM: {response_text}")

                # Strip the ```json marker if present
                if response_text.startswith("```json") and response_text.endswith("```"):
                    response_text = response_text[len("```json"): -len("```")].strip()

                # Parse the response to ensure it is a clean JSON object
                module_content = json.loads(response_text)

                # Add the content to the result
                content[module["module_id"]] = module_content

            return Response({"content": content}, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            logger.error(f"JSONDecodeError: The response could not be parsed as JSON. Raw response: {response_text}")
            return Response(
                {"error": "The response could not be parsed as JSON."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class RegenerateModuleContentView(APIView):
    def post(self, request):
        # Extract inputs from the request
        module_title = request.data.get("module_title")
        submodules = request.data.get("submodules")
        level = request.data.get("level")

        if not all([module_title, submodules, level]):
            return Response(
                {"error": "All fields are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prompt for regenerating content
        content_prompt = f"""
Act as an expert instructor and generate detailed content for the following module and submodules. The content should be comprehensive and structured like a lecture, including explanations, examples, and key points.

Module: {module_title}
Submodules:
{submodules}

Guidelines:
1. Provide a detailed introduction to the module.
2. For each submodule, provide a thorough explanation, including key concepts, examples, and practical applications.
3. Use clear and concise language suitable for {level} students.
4. Ensure the content is well-structured and easy to follow.
5. Do not include any markup symbols or HTML tags in the content.
6. The content should be engaging and informative, as if you are teaching the topic to students.
7. Enhance the content to be more understandable and easy to grasp.

Output the content in a clean JSON format with the following structure:

{{
  "module_content": "<Detailed content for the module>",
  "submodules_content": [
    {{
      "submodule_id": <submodule_id>,
      "content": "<Detailed content for the submodule>"
    }},
    // Add as many submodules as required.
  ]
}}
"""

        try:
            # Set up the prompt and chain
            prompt_template = ChatPromptTemplate.from_messages(
                [
                    ("system", "You are a helpful assistant that generates detailed content for modules and submodules."),
                    ("human", "{content_prompt}"),
                ]
            )
            chain = prompt_template | llm

            # Invoke the chain with the prompt
            response = chain.invoke({"content_prompt": content_prompt})

            # Extract the text content from the AIMessage object
            response_text = response.content

            # Log the raw response for debugging
            logger.info(f"Raw response from LLM: {response_text}")

            # Strip the ```json marker if present
            if response_text.startswith("```json") and response_text.endswith("```"):
                response_text = response_text[len("```json"): -len("```")].strip()

            # Parse the response to ensure it is a clean JSON object
            module_content = json.loads(response_text)

            # Ensure the response is directly parsed and returned as a clean JSON object
            return Response({"module_content": module_content}, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            logger.error(f"JSONDecodeError: The response could not be parsed as JSON. Raw response: {response_text}")
            return Response(
                {"error": "The response could not be parsed as JSON."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# Optionally: Adding DashboardView
class DashboardView(APIView):
    def get(self, request):
        # You can return any necessary data here if you need to fetch something dynamically for the dashboard
        return Response({"message": "Welcome to the AI Syllabus Generator Dashboard"}, status=status.HTTP_200_OK)
