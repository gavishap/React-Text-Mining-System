import mysql.connector
from mysql.connector import Error
import os
import re
import nltk
from collections import Counter
import re
import spacy
nltk.download('punkt')
from nltk.tokenize import word_tokenize, sent_tokenize
from itertools import combinations
nlp = spacy.load("en_core_web_sm")

# Global database name
DATABASE_NAME = "textretrivalsystem"  


def new_database(connection, db_name):
    """
    Creates a new database and initializes it with required tables.
    
    This function takes a database connection and a database name as input.
    It creates the database if it does not exist and then switches to the newly created database.
    After switching, it creates several tables necessary for the text retrieval system,
    including document_list, Words, occurrences, groups_of_words, word_associationed, and declerations.
    
    Parameters:
    - connection: The MySQL database connection object.
    - db_name: The name of the database to create.
    
    Outputs:
    - Prints messages to the console indicating the success of database and table creations.
    - Logs any errors encountered during the process.
    """
    cursor = connection.cursor()
    try:
        # Create the database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database '{db_name}' created successfully.")
        
        # Switch to the new database
        cursor.execute(f"USE {db_name}")  

        # Create document_list table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS document_list (
            doc_id INTEGER AUTO_INCREMENT PRIMARY KEY, 
            name TEXT,
            author TEXT,
            date DATE
        );
        """)
        print("Table document_list created successfully")
        
        # Create Words table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS Words (
        word_id INTEGER AUTO_INCREMENT PRIMARY KEY,
        word VARCHAR(255) UNIQUE
        );
        """)
        print("Table Words created successfully")
        
        # Create occurrences table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS occurrences (
        doc_id INTEGER,
        word_id INTEGER,
        sentence_no INTEGER, 
        para_no INTEGER,
        word_position INTEGER,
        PRIMARY KEY (doc_id, word_id, sentence_no, word_position),
        FOREIGN KEY (doc_id) REFERENCES document_list(doc_id),
        FOREIGN KEY (word_id) REFERENCES Words(word_id)
        );
        """)
        print("Table occurrences created successfully")
        
        # Create groups_of_words table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS groups_of_words (
            group_id INTEGER AUTO_INCREMENT PRIMARY KEY,
            name TEXT 
        );
        """)
        print("Table groups_of_words created successfully")
        
        # Create word_associationed table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS word_associationed (
            word_id INTEGER AUTO_INCREMENT ,
            word TEXT,
            group_id INTEGER,
            PRIMARY KEY (word_id, group_id),
            FOREIGN KEY (group_id) REFERENCES groups_of_words(group_id)
        );
        """)
        print("Table word_associationed created successfully")
        
        # Create declerations table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS declerations (
            decleration_id INTEGER PRIMARY KEY AUTO_INCREMENT,
            decleration TEXT,
            words_decleration TEXT
        );
        """)
        print("Table declerations created successfully")

    except Error as err:
        print(f"Error: '{err}'")


def connection_to_database(host_name, user_name, user_password, db_name=None):
    """
    Establishes a connection to the MySQL database.

    Args:
    - host_name: The hostname of the database server.
    - user_name: The username used to authenticate with the database.
    - user_password: The password used to authenticate with the database.
    - db_name: Optional. The name of the database to connect to.

    Returns:
    - A connection object if the connection is successful, None otherwise.
    """
    connection = None
    try:
        if db_name:
            connection = mysql.connector.connect(
                host=host_name,
                user=user_name,
                passwd=user_password,
                database=db_name
            )
        else:
            connection = mysql.connector.connect(
                host=host_name,
                user=user_name,
                passwd=user_password
            )
    except Error as err:
        print(f"Error: '{err}'")
    return connection


def query_reading(connection, query, params=None):
    """
    Executes a read query on the database.

    Args:
    - connection: The database connection object.
    - query: The SQL query to execute.
    - params: Optional. The parameters to substitute into the query.

    Returns:
    - The result of the query execution.
    """
    result = None
    cursor_reading = None
    try:
        cursor_reading = connection.cursor()
        if params:
            cursor_reading.execute(query, params)
        else:
            cursor_reading.execute(query)
        result = cursor_reading.fetchall()
    except Error as err:
        print(f"Error: '{err}'")
    finally:
        if cursor_reading:
            cursor_reading.close()
    return result


def query_execution(connection, query, params=None):
    """
    Executes a write query on the database.

    Args:
    - connection: The database connection object.
    - query: The SQL query to execute.
    - params: Optional. The parameters to substitute into the query.

    """
    cursor = None
    try:
        cursor = connection.cursor()
        cursor.execute(query, params or ())
        connection.commit()
        print("Query successful")
    except Error as err:
        print(f"Error: '{err}'")
    finally:
        if cursor:
            cursor.close()


def text_processing(connection, document_id, file_path):
    """
    Processes the text of a document, tokenizing it into words, sentences, and paragraphs,
    and stores these details in the database.

    Args:
    - connection: The database connection object.
    - document_id: The ID of the document being processed.
    - file_path: The path to the file containing the document text.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            text_content = file.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    paragraphs = re.split('\n+', text_content)

    for para_no, paragraph in enumerate(paragraphs, start=1):
        sentences = sent_tokenize(paragraph)

        for sentence_no, sentence in enumerate(sentences, start=1):
            words = word_tokenize(sentence.lower())

            for word_position, word in enumerate(words, start=1):
                if not word.isalpha():
                    continue

                insert_word_query = """
                INSERT INTO Words (word)
                VALUES (%s)
                ON DUPLICATE KEY UPDATE word_id=LAST_INSERT_ID(word_id);
                """
                query_execution(connection, insert_word_query, (word,))

                word_id_result = query_reading(connection, "SELECT LAST_INSERT_ID();", [])
                if word_id_result and len(word_id_result) > 0:
                    word_id = word_id_result[0][0]

                    insert_occurrence_query = """
                    INSERT INTO occurrences (doc_id, word_id, sentence_no, para_no, word_position)
                    VALUES (%s, %s, %s, %s, %s);
                    """
                    query_execution(connection, insert_occurrence_query, (document_id, word_id, sentence_no, para_no, word_position))
                else:
                    print(f"Failed to retrieve word_id for word: {word}")

        sentence_no += 1
        if re.search("\n+", sentence):
            para_no += 1

    print(f"Processed and stored words from document {document_id}")


def declaration_creation(connection, declaration, words_declaration):
    """
    Creates a new declaration in the database.

    This function inserts a new declaration along with its associated words into the 'declarations' table.
    It constructs an SQL INSERT query to add the new declaration and its words to the database.
    After executing the query, it commits the transaction to ensure data integrity.

    Args:
    - connection: The database connection object.
    - declaration: The declaration text to be inserted.
    - words_declaration: The associated words with the declaration to be inserted.

    Prints and logs the success of the operation.
    """
    cursor = connection.cursor()
    # Using parameterized queries to prevent SQL injection
    cursor = connection.cursor()
    query_string = "INSERT INTO declerations (decleration, words_decleration) VALUES ('{}','{}')".format(declaration, words_declaration)
    print(query_string)
    cursor.execute(""+ query_string + "")
    connection.commit()
    print("Query successful")
    print(f"Query successful: Expression '{declaration, words_declaration}' created successfully.")
   

def get_frequent_words(file_path, num):
    frequent_words = []
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            # Read the entire content of the file
            content = file.read()

            # Split the content into words using regular expression
            words = re.findall(r'\b\w+\b', content.lower())  # Convert to lowercase for case-insensitive counting

            exclude_words = {  'that', 'as', 'for','by', 'with', 'were', 'on', 'is', 'it','be', 'which', 'this', 'from', 'at', 'an',  'also', 'are', 'has', 'had', 'have', 'been', 'or', 'not', 'but', 'its', 'their', 'they', 'them', 'we', 'our','the', 'in', 'and', 'of', 'to', 'a', 'us', 'was' 'me', 'my', 'mine', 'us', 'you', 'your', 'he', 'she', 'his', 'her', 'him', 'i', 'we', 'ours', 'ourselves', 'yours', 'their', 'theirs', 'themselves', 'what', 'who', 'whom', 'whose', 'which', 'where', 'yourself', 'yourselves', 'himself', 'herself', 'itself', 'themselves', 'they', 'them', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'than', 'too', 'very', 'can', 'will', 'just', 'now', 'ain', 'are', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'could', 'has', 'is', 'should', 'was', 'would'}

            # Filter out the excluded words
            filtered_words = [word for word in words if word not in exclude_words]

            # Count the occurrences of each word
            word_counts = Counter(filtered_words)

            # Get the most frequent words and their occurrences
            most_common_words = word_counts.most_common(num)
            for word, count in most_common_words:
                frequent_words.append({"word": word, "count": count})
                
    except FileNotFoundError:
        print(f"File '{file_path}' not found.")
        
    return frequent_words

def fetch_all_declarations(connection):
    arr = []
    
    try:
        # Create a cursor object to interact with the database
        cursor = connection.cursor()

        # Execute a SELECT query to fetch all data from the table
        cursor.execute("SELECT * FROM declerations where decleration is not null AND words_decleration is not null")

        # Fetch all rows from the result set
        rows = cursor.fetchall()

        for row in rows:
            arr.append({
                "id": row[0],
                "name": row[1],
                "words": row[2]
            })

    except mysql.connector.Error as error:
        print("Error while fetching data from the MySQL database:", error)

    finally:
        # Close the cursor and the connection
        cursor.close()
        connection.close()
        
    return arr


# Implement data mining
def mining(file_path):
    context = []
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            text_content = file.read()
            doc = nlp(text_content)

            for ent in doc.ents:
                context.append({
                    'text': ent.text,
                    'type': ent.label_
                })
    except Exception as e:
        print(f"Error reading file: {e}")
       
        return
    
    # Process the text using spaCy
    
    return context
