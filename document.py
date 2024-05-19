import mysql.connector
from mysql.connector import Error
import os
import re
import nltk
from collections import Counter
import re
import database
import spacy
nltk.download('punkt')
from nltk.tokenize import word_tokenize, sent_tokenize
from itertools import combinations
nlp = spacy.load("en_core_web_sm")

# Global database name
DATABASE_NAME = "textretrivalsystem"  


def document_upload(connection, file_path, metadata):
    # Check if the file exists
    if not os.path.isfile(file_path):
        print("File not found.")
       
        return
    
    # Read the file and extract text (assuming the file is not too large to fit in memory)
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            text_content = file.read()
    except Exception as e:
        print(f"Error reading file: {e}")
      
        return
    
    # Prepare the metadata
    name = metadata.get('name', 'Unknown')
    author = metadata.get('author', 'Unknown')
    date = metadata.get('date', '0000-00-00')  # Default date in case none is provided

    # Prepare the SQL query to insert metadata
    insert_query = """
    INSERT INTO document_list (name, author, date)
    VALUES (%s, %s, %s);
    """
    
    # Execute the query to insert the document metadata
    database.query_execution(connection, insert_query, (name, author, date))

def document_save_and_metadata(connection, file_path, metadata):
    # Create the database if it doesn't exist
    database.new_database(connection, DATABASE_NAME)
    try:
        document_upload(connection, file_path, metadata)
        doc_id_query = "SELECT LAST_INSERT_ID();"
        doc_id_result = database.query_reading(connection, doc_id_query)
        doc_id = doc_id_result[0][0] if doc_id_result else None
    except Exception as e:
        print(f"Error saving document and metadata: {e}")
      
        return None
    return doc_id


def fetch_all_documents(connection):
    documents = []
    try:
        # Create a cursor object to interact with the database
        cursor = connection.cursor()

        # Execute a SELECT query to fetch all data from the table
        cursor.execute("SELECT * FROM document_list WHERE name IS NOT NULL")

        # Fetch all rows from the result set
        rows = cursor.fetchall()

        for row in rows:
            documents.append({
                "id": row[0],
                "name": row[1]
            })

    except Error as error:
        print("Error while fetching data from the database:", error)

    finally:
        # Close the cursor
        if cursor:
            cursor.close()
        # Close the connection
        if connection:
            connection.close()
        
    return documents
