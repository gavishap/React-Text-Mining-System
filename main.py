from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import re
import database  
import document
# Import necessary libraries and modules
import word as word_function  # Custom module for word-related functions
DATABASE_NAME = "textretrivalsystem"  # Constant for the database name
app = Flask(__name__)  # Initialize Flask app
from flask_cors import CORS  # Import CORS module for handling Cross-Origin Resource Sharing

UPLOAD_FOLDER = 'uploads'  # Define the directory for uploaded files
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER  # Configure Flask app to use the defined upload folder

CORS(app)  # Enable CORS for the Flask app

# Create the upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)  # Create the directory
    print("Created upload folder")  # Log the creation of the folder

# Function to get all text from a document
def get_all_words(file_path):
    arr = []  # Initialize an empty list to store words
    try:
        with open(file_path, 'r', encoding='utf-8') as file:  # Open the file with read permissions
            for line in file:  # Iterate through each line in the file
                words = line.split()  # Split the line into words
                arr.extend(words)  # Add the words to the list
            return arr  # Return the list of words
    except FileNotFoundError:  # Handle the case where the file does not exist
        print(f"File '{file_path}' not found.")  # Log the error
        return None  # Return None to indicate failure

# Flask route to fetch all documents or words from a specific document
@app.route("/documents_list", methods=['GET'])
def fetch_all_documents():
    connection = database.connection_to_database("localhost", "root", "password", DATABASE_NAME)  # Establish database connection
    res = []  # Initialize an empty list to store results
    filename = request.args.get('filename')  # Get the filename from request arguments
    if filename:  # If a filename is provided
        print("filename print" + filename)  # Log the filename
        file_path = "./uploads/" + filename + ".txt"  # Construct the file path
        res = get_all_words(file_path)  # Get all words from the document
    else:  # If no filename is provided
        res = document.fetch_all_documents(connection)  # Fetch all documents from the database
    
    return jsonify(res), 200  # Return the results as JSON with a 200 OK status

# Flask route to upload a document
@app.route('/upload_document', methods=['POST'])
def document_upload():
    print("Received upload request")  # Log the upload request
    if 'file' not in request.files:  # Check if the file part is present in the request
        return jsonify({"message": "No file part"}), 400  # Return an error message if the file part is missing
    file = request.files['file']  # Get the file from the request
    if file.filename == '':  # Check if a file was selected
        return jsonify({"message": "No selected file"}), 400  # Return an error message if no file was selected

    metadata = {  # Extract metadata from the request form
        'name': request.form.get('name', 'Unknown'),  # Get the name or use 'Unknown' as default
        'author': request.form.get('author', 'Unknown'),  # Get the author or use 'Unknown' as default
        'date': request.form.get('date', 'Unknown'),  # Get the date or use 'Unknown' as default
    }
    print(f"Metadata received: {metadata}")  # Log the received metadata

    if file:  # If a file is present
        filename = secure_filename(file.filename)  # Secure the filename to prevent directory traversal attacks
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)  # Construct the file path
        file.save(file_path)  # Save the file to the upload folder
        print(f"File saved at {file_path}")  # Log the file save location

        # Connect to the database
        connection = database.connection_to_database("localhost", "root", "password", DATABASE_NAME)
        print("Connected to the database")  # Log the database connection

        # Save document metadata and get document ID
        doc_id = document.document_save_and_metadata(connection, file_path, metadata)
        print(f"Document ID received: {doc_id}")  # Log the received document ID

        # Process the document text and store word occurrences
        database.text_processing(connection, doc_id, file_path)
        print("Processed the document text and stored word occurrences")  # Log the text processing

        # Close the database connection
        connection.close()
        print("Closed the database connection")  # Log the database connection closure
        
        return jsonify({"message": "File uploaded successfully", "document_id": doc_id}), 200  # Return success message

   
    return jsonify({"message": "Unknown error"}), 500



@app.route('/context', methods=['GET'])
def fetch_word_context():
    print("Received word context request")
    word = request.args.get('word')
    print(f"Request Params: {request.args}")
    if not word:
        print("Word parameter is missing in request")
        return jsonify({"error": "Word parameter is required"}), 400
    # Replace this line in your Flask endpoints
    connection = database.connection_to_database("localhost", "root", "password", DATABASE_NAME)
    doc_id = request.args.get('doc_id')
    paragraph = request.args.get('paragraph')
    sentence = request.args.get('sentence')
    line_number = request.args.get('lineNumber')
    line_range = request.args.get('lineRange')
    print(f"Filters received: word={word}, doc_id={doc_id}, paragraph={paragraph}, sentence={sentence}, line_number={line_number}")
    # Call a new function to get word context with filters
    contexts = word_function.retrieve_word_contexts(connection, word, doc_id, paragraph, sentence, line_number)
    print(f"Received contextsssss: {contexts}")
    response = []
    for context in contexts:
        word, sentence_no, para_no, doc_name = context
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], doc_name + '.txt')
        context_paragraph = word_function.retrieve_sentences_surrounded(file_path, sentence_no, para_no)
        context_dict = {
            'word': word,
            'sentence_no': int(sentence_no),
            'paragraph_no': int(para_no),
            'doc_name': doc_name,
            'context_paragraph': context_paragraph
        }
        
        response.append(context_dict)
        
    response.sort(key=lambda x: (x['paragraph_no'], x['sentence_no']))
    print(f"Received contexts: {response}")
    return jsonify(response)



@app.route('/word_group', methods=['POST'])
def save_group():
    data = request.json
    print(data['name'])
    connection = database.connection_to_database("localhost", "root", "password", DATABASE_NAME)
    result = word_function.word_group_creation(connection,[data['name']])
    
    if result:
        return jsonify({"message": "Group saved successfully !!!"}), 200
    else:
        return jsonify({"message": "An error occured while saving group "}), 500


@app.route('/word_group/new_word', methods=['POST'])
def save_word_to_group():
    data = request.json
    print(data)
    connection = database.connection_to_database("localhost", "root", "password", DATABASE_NAME)
    result = word_function.save_word_to_group_in_database(connection,(data['group_id'],data['word']))
    
    if result:
        return jsonify({"message": "Word saved to group successfully !!!"}), 200
    else:
        return jsonify({"message": "An error occured while saving word to  group "}), 500
    



@app.route('/decleration', methods=['POST'])
def save_decleration():
    data = request.json
    connection = database.connection_to_database("localhost", "root", "password", DATABASE_NAME)
    result = database.declaration_creation(connection,data['decleration'],data['words_decleration'])
    
    if result:
        return jsonify({"message": "Expression saved successfully !!!"}), 200
    else:
        return jsonify({"message": "An error occured while saving expression "}), 500



@app.route('/words', methods=['GET'])
def get_filtered_words():
    """
    Fetches words based on filters provided via request arguments and returns them in a JSON format.
    """
    print("recieved request for all the words")
    db_connection = database.connection_to_database("localhost", "root", "password", DATABASE_NAME)
    # Retrieve filters from request arguments
    document_id = request.args.get('doc_id')
    initial_letter = request.args.get('startingLetter')
    para_no = request.args.get('paragraph')
    sent_no = request.args.get('sentence')
    word_position = request.args.get('lineNumber')
    position_range = request.args.get('lineRange')
    print(f"filters received: doc_id={document_id}, starting_letter={initial_letter}, paragraph={para_no}, sentence={sent_no}, line_number={word_position}, line_range={position_range}")
    # Invoke function to fetch words based on filters
    filtered_words = word_function.retrieve_filtered_words(db_connection, document_id, initial_letter, para_no, sent_no, word_position)
    print(f"filtered words: {filtered_words}")
    word_list = []
    for word in filtered_words:
        word_list.append(word[0])
    return jsonify(word_list)


# endpoint to generate statistics
@app.route("/statistics",methods=['GET'])
def statistics():
    """
    Generates and returns statistics for a given file.
    
    This endpoint accepts a filename and a frequency parameter from the request arguments.
    It calculates various statistics such as the number of paragraphs, sentences, words, and letters in the file.
    Additionally, it retrieves the most frequent words based on the provided frequency.
    It also calculates sentence and paragraph statistics along with total letter counts.
    
    Returns:
        A JSON response containing the calculated statistics or an error message if the file is not found.
    """
    file_name_query = request.args.get('filename')
    word_frequency_query = request.args.get('frequency')
    
    if not word_frequency_query:
        word_frequency_query = 10

    else:
        word_frequency_query = int(word_frequency_query)
    
    if not file_name_query:
        return jsonify({'message': 'no file received'}),400
    
    file_location = "./uploads/"+file_name_query+'.txt'
    
    try:
        with open(file_location, 'r',encoding='utf-8') as file_obj:
            # Read the entire content of the file
            get_all_words = file_obj.read()

            # Count the number of paragraphs (assumed to be separated by empty lines)
            paragraph_list = re.split('\n+', get_all_words)
            paragraph_count = len(paragraph_list)

            # Count the number of sentences (assumed to be separated by '.', '!', or '?')
            sentence_list = [sentence.strip() for sentence in get_all_words.split('.') if sentence.strip()]
            sentence_list += [sentence.strip() for sentence in get_all_words.split('!') if sentence.strip()]
            
            sentence_list += [sentence.strip() for sentence in get_all_words.split('?') if sentence.strip()]
            sentence_count = len(sentence_list)

            # Count the number of words
            word_list = get_all_words.split()
            word_count = len(word_list)
            
            # Get the most frequent words
            frequent_words_list = database.get_frequent_words(file_location,word_frequency_query)
            
            sentence_stats, paragraph_stats, letter_count_stats = word_function.count_words_and_characters(file_location)
            

            # Count the number of letters
            letter_count = sum(len(word) for word in word_list)
            
             # Compile statistics response
            stats_data = {
                'paragraphs': paragraph_count,
                'sentences': sentence_count,
                'words': word_count,
                'letters': letter_count
            }
            
            compiled_response = {
                'stats': stats_data,
                'frequency': frequent_words_list,
                'sentence': sentence_stats,
                'paragraph': paragraph_stats,
                'total_letters_counts': letter_count_stats
            }

            # Return the compiled statistics
            return jsonify(compiled_response), 200

    except FileNotFoundError:
        print(f"File '{file_location}' not found.")
        return jsonify({'message': 'Error processing file'}),400

# Data Mining Endpoint
@app.route("/data_mining", methods=['GET'])
def mine_data():
    """
    Endpoint to mine data from a given file.
    It expects a filename as a query parameter, processes the file, and returns mined data.
    """
    # Retrieve the filename from the query parameters
    filename_query = request.args.get('filename')
    
    # Check if the filename is provided
    if not filename_query:
        return jsonify({'message': 'No file specified'}), 400
    
    # Construct the full file path
    full_file_path = "./uploads/" + filename_query + '.txt'
    
    # Mine data from the file
    mined_data = database.mining(full_file_path)
    
    # Return the mined data as JSON
    return jsonify(mined_data), 200

# get all expressions
@app.route("/declarations",methods=['GET'])
def fetch_all_declarations():
    connection = database.connection_to_database("localhost", "root", "password", DATABASE_NAME)
    res = database.fetch_all_declarations(connection)
    
    return jsonify(res), 200



@app.route("/word_group",methods=['GET'])
def fetch_all_groups():
    connection = database.connection_to_database("localhost", "root", "password", DATABASE_NAME)
    res = word_function.fetch_all_groups(connection)
    
    return jsonify(res), 200

# get all words of a particular group_id
@app.route("/word_group/words_list",methods=['GET'])
def fetch_all_words_groups():
    connection = database.connection_to_database("localhost", "root", "password", DATABASE_NAME)
    groupe_id = request.args.get('group_id')
    res = word_function.fetch_all_words_in_group(connection,groupe_id)
    
    return jsonify(res), 200




if __name__ == "__main__":
    
    connection = database.connection_to_database("localhost", "root", "password")
    database.new_database(connection, DATABASE_NAME)
    app.run(debug=True)
