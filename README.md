AI-Powered Resume Analyzer (ATS Optimizer)

This project is an intelligent Resume Analysis and Job Matching system that applies Machine Learning and Natural Language Processing (NLP) techniques to evaluate resumes, predict job domains, extract skills, and provide ATS optimization suggestions. The goal is to help job seekers enhance their resumes to meet industry standards and employer requirements.

Key Features
Evaluates resume quality and calculates an ATS score based on formatting, keywords, and skill relevance.
Extracts hard and soft skills from resumes using NLP.
Classifies resumes into job categories such as Data Science, HR, Software Engineering, Finance, Aviation, and more.
Compares resume content with job descriptions to recommend missing keywords.
Generates visual insights such as word clouds and skill frequency graphs.
Can be easily deployed with a user interface such as Streamlit or Flask.

Dataset Information
The project uses cleaned job description data along with resume data. These documents are categorized into multiple job domains such as:
Data Science
Software Engineering
Human Resources
Finance
Marketing
Aviation
and Others

The primary dataset used: 
from kaggle /kaggle/input/job-description-resume/cleaned_jobs.csv
Tech Stack Used
Python for overall development.
Pandas and NumPy for data cleaning and manipulation.
NLTK and spaCy for NLP tasks like tokenizing, stopword removal, skill extraction, and named entity recognition.
Scikit-Learn for building classification models.
Matplotlib and WordCloud for creating visual insights like category frequency graphs and skill clouds.
SBERT embeddings for semantic representations and matching.




**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
