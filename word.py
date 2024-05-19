import mysql.connector
from mysql.connector import Error
import os
from collections import Counter
import re
import database
import spacy
import re
import nltk
nltk.download('punkt')
from nltk.tokenize import word_tokenize, sent_tokenize
from itertools import combinations
nlp = spacy.load("en_core_web_sm")


DATABASE_NAME = "textretrivalsystem"  

# Function to create a new word group in the database
def word_group_creation(connection, group_name):
    """
    Creates a new word group in the database.

    Args:
    - connection: The database connection object.
    - group_name: The name of the word group to be created.

    This function executes an SQL query to insert a new word group into the 'groups_of_words' table.
    It logs the success or error of the operation.
    """
    # SQL query to insert a new word group
    insert_query = """
    INSERT INTO groups_of_words (name)
    VALUES (%s);
    """

    # Execute the query
    try:
        database.query_execution(connection, insert_query, group_name)
        print(f"Word group '{group_name}' created successfully.")
    except Error as err:
        print(f"Error: '{err}'")

# Function to add words to a word group
def add_word_to_group(connection, word, group_name):
    """
    Adds a word to a specified word group in the database.

    Args:
    - connection: The database connection object.
    - word: The word to be added to the group.
    - group_name: The name of the group to which the word will be added.

    This function first retrieves the IDs for the specified word and group,
    then links the word to the group in the 'word_associationed' table.
    """
    # Find the word_id
    word_id_query = "SELECT word_id FROM Words WHERE word = %s;"
    word_id_result = database.query_reading(connection, word_id_query, (word,))
    word_id = word_id_result[0][0] if word_id_result else None

    # Find the group_id
    group_id_query = "SELECT group_id FROM groups_of_words WHERE name = %s;"
    group_id_result = database.query_reading(connection, group_id_query, (group_name,))
    group_id = group_id_result[0][0] if group_id_result else None

    if word_id and group_id:
        # Link the word to the group
        insert_query = """
        INSERT INTO word_associationed (word_id, group_id)
        VALUES (%s, %s);
        """
        database.query_execution(connection, insert_query, (word_id, group_id))
        print(f"Word '{word}' added to group '{group_name}' successfully.")
        
    else:
        print("Word or group not found.")

# Function to get all words in a group
def fetch_all_words_in_group(connection, group_id):
    """
    Retrieves all words associated with a specified group ID.

    Args:
    - connection: The database connection object.
    - group_id: The ID of the group from which to fetch words.

    Returns:
    - A list of dictionaries, each containing word_id, group_id, and word.

    This function executes a query to fetch all words linked to the specified group ID
    from the 'word_associationed' table.
    """
    words = []
    try:
        # Create a cursor object to interact with the database
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM word_associationed WHERE group_id = %s", (group_id,))

        # Fetch all rows from the result set
        rows = cursor.fetchall()

        for row in rows:
            words.append({
                "word_id": row[0],
                "group_id": row[2],
                "word": row[1]
            })

    except Error as error:
        print("Error while fetching data from the database:", error)

    finally:
        # Close the cursor
        if cursor:
            cursor.close()
        
    return words

def word_occurrences_search(connection, word):
    """
    Searches for occurrences of a word across documents in the database.

    Args:
    - connection: The database connection object.
    - word: The word to search for.

    Returns:
    - A list of occurrences, each occurrence includes document name, author, sentence number, paragraph number, and chapter number.

    This function executes a query to find all occurrences of the specified word,
    along with context information such as document name, author, and location within the document.
    """
    # SQL query to find word occurrences along with context information
    query = """
    SELECT d.name, d.author, wo.sentence_no, wo.para_no, wo.chapter_no
    FROM Words w
    JOIN occurrences wo ON w.word_id = wo.word_id
    JOIN document_list d ON wo.doc_id = d.doc_id
    WHERE w.word = %s;
    """

    # Execute the query
    occurrences = database.query_reading(connection, query, (word,))

    if not occurrences:
        print(f"No occurrences found for the word: {word}")
       
        return []

    # Print or return the list of occurrences
    for occurrence in occurrences:
        print(f"Document: {occurrence[0]}, Author: {occurrence[1]}, Sentence: {occurrence[2]}, Paragraph: {occurrence[3]}, Chapter: {occurrence[4]}")

    return occurrences

def retrieve_word_context(connection, word, doc_id=None):
    query = """
    SELECT d.name, d.author, wo.sentence_no, wo.para_no
    FROM Words
    JOIN occurrences wo ON Words.word_id = wo.word_id
    JOIN document_list d ON wo.doc_id = d.doc_id
    WHERE Words.word = %s
    """
    params = [word]
    if doc_id:
        query += " AND wo.doc_id = %s"
        params.append(doc_id)
    return database.query_reading(connection, query, params)

def retrieve_words(connection, doc_id=None):
    query = "SELECT DISTINCT word FROM Words"
    if doc_id:
        query += " JOIN occurrences ON Words.word_id = occurrences.word_id WHERE occurrences.doc_id = %s"
        return database.query_reading(connection, query, [doc_id])
    else:
        return database.query_reading(connection, query)
    



def retrieve_filtered_words(connection, doc_id=None, starting_letter=None, paragraph=None, sentence=None, line_number=None):
    print("retrieve_filtered_words called with parameters:", locals())
    query = """
    SELECT DISTINCT Words.word
    FROM Words
    JOIN occurrences ON Words.word_id = occurrences.word_id
    """
    params = []

    if doc_id:
        query += " JOIN document_list ON occurrences.doc_id = document_list.doc_id WHERE document_list.doc_id = %s"
        params.append(doc_id)
        print("Filtering by doc_id:", doc_id)

    if starting_letter:
        query += " AND Words.word LIKE %s"
        params.append(starting_letter + '%')
        print("Filtering by starting_letter:", starting_letter)

    if paragraph:
        query += " AND occurrences.para_no = %s"
        params.append(paragraph)
        print("Filtering by paragraph:", paragraph)

    if sentence:
        query += " AND occurrences.sentence_no = %s"
        params.append(sentence)
        print("Filtering by sentence:", sentence)

    if line_number:
        # Assuming line_number corresponds to a specific word_position
        query += " AND occurrences.word_position = %s"
        params.append(line_number)
        print("Filtering by line_number:", line_number)

    print("Executing query:", query)
    print("With parameters:", params)
    return database.query_reading(connection, query, params)


def retrieve_word_contexts(connection, word, doc_id=None, paragraph=None, sentence=None, line_number=None):
    print("retrieve_word_contexts called with parameters:", locals())
    query = """
    SELECT Words.word, occurrences.sentence_no, occurrences.para_no, document_list.name
    FROM Words
    JOIN occurrences ON Words.word_id = occurrences.word_id
    JOIN document_list ON occurrences.doc_id = document_list.doc_id
    WHERE Words.word = %s
    """
    params = [word]
    print("Filtering by word:", word)

    if doc_id:
        query += " AND document_list.doc_id = %s"
        params.append(doc_id)
        print("Filtering by doc_id:", doc_id)

    if paragraph:
        query += " AND occurrences.para_no = %s"
        params.append(paragraph)
        print("Filtering by paragraph:", paragraph)

    if sentence:
        query += " AND occurrences.sentence_no = %s"
        params.append(sentence)
        print("Filtering by sentence:", sentence)

    if line_number:
        query += " AND occurrences.word_position = %s"
        params.append(line_number)
        print("Filtering by line_number:", line_number)

   

    print("Executing query:", query)
    print("With parameters:", params)
    return database.query_reading(connection, query, params)


def save_group_to_database(connection, data):
    success = False
    try:
        # Create a cursor object to interact with the database
        cursor = connection.cursor()
        
        # Insert data into the table
        sql = '''INSERT INTO groups_of_words (name) VALUES (%s)'''
        cursor.execute(sql, data)
        
        # Commit the transaction
        connection.commit()
        success = True
        print("Group Saved Successfully !!!")
        
    except Error as error:
        print("Error while saving data to the database:", error)
        
    finally:
        # Close the cursor
        if cursor:
            cursor.close()
        # Close the connection
        if connection:
            connection.close()
        
    return success

def save_word_to_group_in_database(connection, data):
    success = False
    try:
        # Create a cursor object to interact with the database
        cursor = connection.cursor()
        
        # Insert data into the table
        sql = '''INSERT INTO word_associationed (group_id,word) VALUES (%s, %s)'''
        cursor.execute(sql, data)
        
        # Commit the transaction
        connection.commit()
        success = True
        print("Word Saved To Group Successfully !!!")
        
    except Error as error:
        print("Error while saving data to the database:", error)
        
    finally:
        # Close the cursor
        if cursor:
            cursor.close()
        # Close the connection
        if connection:
            connection.close()
        
    return success

def fetch_all_groups_from_database(connection):
    groups = []
    try:
        # Create a cursor object to interact with the database
        cursor = connection.cursor()

        # Execute a SELECT query to fetch all data from the table
        cursor.execute("SELECT * FROM groups_of_words WHERE name IS NOT NULL")

        # Fetch all rows from the result set
        rows = cursor.fetchall()

        for row in rows:
            groups.append({
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
        
    return groups


def fetch_all_groups(connection):
    groups = []
    try:
        # Create a cursor object to interact with the database
        cursor = connection.cursor()

        # Execute a SELECT query to fetch all data from the table
        cursor.execute("SELECT * FROM groups_of_words WHERE name IS NOT NULL")

        # Fetch all rows from the result set
        rows = cursor.fetchall()

        for row in rows:
            groups.append({
                "id": row[0],
                "name": row[1]
            })

    except Error as error:
        print("Error while fetching data from the database:", error)

    finally:
        # Close the cursor
        if cursor:
            cursor.close()
        
    return groups


def document_statistics_retrieval(connection, document_id):
    # Query to count the total number of word occurrences in the document
    total_words_query = """
    SELECT COUNT(*)
    FROM occurrences
    WHERE doc_id = %s;
    """

    # Query to count the number of unique words in the document
    unique_words_query = """
    SELECT COUNT(DISTINCT word_id)
    FROM occurrences
    WHERE doc_id = %s;
    """

    # Query to get the frequency of each word in the document
    word_frequency_query = """
    SELECT w.word, COUNT(*)
    FROM occurrences wo
    JOIN Words w ON wo.word_id = w.word_id
    WHERE wo.doc_id = %s
    GROUP BY w.word
    ORDER BY COUNT(*) DESC;
    """

    try:
        # Execute the total words query
        total_words = database.query_reading(connection, total_words_query, (document_id,))[0][0]

        # Execute the unique words query
        unique_words = database.query_reading(connection, unique_words_query, (document_id,))[0][0]

        # Execute the word frequency query
        word_frequencies = database.query_reading(connection, word_frequency_query, (document_id,))

        # Print the statistics
        print(f"total words in document {document_id}: {total_words}")
        
        print(f"unique words in document {document_id}: {unique_words}")
        
        print(f"word frequencies in document {document_id}:")
        
        for word, count in word_frequencies:
            print(f" {word}: {count}")
           

        return total_words, unique_words, word_frequencies

    except Error as err:
        print(f"Error: '{err}'")
        
        return None

def retrieve_sentences_surrounded(file_path, sentence_no, para_no):
    
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    paragraphs = re.split('\n+', text)
    
    
    para_no = max(0, min(para_no - 1, len(paragraphs) - 1))
    
    sentences = sent_tokenize(paragraphs[para_no])
    
    # Adjust sentence_no to be zero-based and within the range of sentences in the paragraph
    sentence_no = max(0, min(sentence_no - 1, len(sentences) - 1))
    
    # Initialize context sentences list
    context_sentences = []
    
    # If the target sentence is the first in its paragraph, include sentences from the previous paragraph
    if sentence_no == 0 and para_no > 0:
        previous_paragraph_sentences = sent_tokenize(paragraphs[para_no - 1])
        context_sentences.extend(previous_paragraph_sentences[-2:])
    
    # Calculate the range of sentences to include from the current paragraph
    start_index = max(0, sentence_no - 2)
    end_index = min(len(sentences), sentence_no + 3)  # +3 to include the target, and up to 2 sentences after
    
    # Extend the context sentences list with sentences from the current paragraph
    context_sentences.extend(sentences[start_index:end_index])
    
    # If the target sentence is the last in its paragraph, include sentences from the next paragraph
    if sentence_no == len(sentences) - 1 and para_no < len(paragraphs) - 1:
        next_paragraph_sentences = sent_tokenize(paragraphs[para_no + 1])
        context_sentences.extend(next_paragraph_sentences[:2])
    
    # Join the context sentences to form the context paragraph
    context_paragraph = ' '.join(context_sentences)
    
    return context_paragraph



def count_words_and_characters(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            # Read the entire content of the file
            content = file.read()

            # Tokenize the content into sentences
            sentences = nltk.sent_tokenize(content)

            # Initialize lists to store results for sentences and paragraphs
            sentence_results = []
            paragraph_results = []
            counter = 1
            total_num_chars = 0
            total_num_words = 0

            for sentence in sentences:
                # Count words and characters in each sentence
                words = sentence.split()
                num_words = len(words)
                num_characters = sum(len(word) for word in words)
                sentence_results.append({'sentence': counter, 'num_words': num_words, 'num_characters': num_characters})
                counter += 1
                total_num_chars += num_characters
                total_num_words += num_words

            # Tokenize the content into paragraphs (assuming paragraphs are separated by empty lines)
            paragraphs = re.split('\n+', content)
            
            counter = 1

            for paragraph in paragraphs:
                # Count words and characters in each paragraph
                words = paragraph.split()
                num_words = len(words)
                num_characters = sum(len(word) for word in words)
                paragraph_results.append({'paragraph': counter, 'num_words': num_words, 'num_characters': num_characters})
                counter += 1

            total_letter_stats = {'total_num_chars': total_num_chars, 'total_num_words': total_num_words}
            
            return sentence_results, paragraph_results, total_letter_stats

    except FileNotFoundError:
        print(f"File '{file_path}' not found.")
        return None   
