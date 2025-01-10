from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    # MongoDB Atlas URI
    uri = "mongodb+srv://prakashbalan555:aicourse@ai-course.si9g6.mongodb.net/"
    
    logger.info("Attempting to connect to MongoDB Atlas...")
    
    # Create a new client and connect to the server
    client = MongoClient(uri, server_api=ServerApi('1'))
    
    # Send a ping to confirm a successful connection
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB Atlas!")
    
    # Get database and collections
    db = client["login_system"]
    users_collection = db["users"]
    admins_collection = db["admins"]

    # Create indexes for email (unique) for both collections
    users_collection.create_index("email", unique=True)
    admins_collection.create_index("email", unique=True)

except Exception as e:
    logger.error("Error connecting to MongoDB Atlas: %s", str(e), exc_info=True)
    raise 