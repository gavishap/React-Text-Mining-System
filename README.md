Text Analysis Application


Features

- Provides a REST API for document uploads and processing tasks.
- Integrates with MySQL for efficient data storage and retrieval operations.
- Offers text analysis capabilities, including tokenization and tracking of word occurrences.
- Generates detailed statistics

Installation:

- Python 3.x
- Flask
- MySQL
- NLTK (Natural Language Toolkit)



Install Dependencies:
  
   pip3 install flask mysql-connector-python nltk pip install spacy
   
Install Dependencies:
  
   python -m spacy download en_core_web_sm


 Set Up MySQL Database:
   - Ensure MySQL is installed and running.
   - Create a database and user with appropriate privileges.
   - Make sure these are the credentials of the database: "localhost", "root", "password"


Run the Flask Application:
  
   python main.py
 

