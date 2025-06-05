import re

# 1. Copy index.html to index-refactor.html
# This will be done by the shell command before running this script if using run_in_bash_session
# For standalone execution, it would be:
# import shutil
# shutil.copy("index.html", "index-refactor.html")

# 2. Read the content of index-refactor.html
try:
    with open("index-refactor.html", "r", encoding="utf-8") as f:
        html_content = f.read()
except FileNotFoundError:
    print("Error: index-refactor.html not found. Make sure it was copied successfully.")
    exit(1)

# 3. Remove the original script.js tag
original_script_tag = '<script src="script.js"></script>'
html_content = html_content.replace(original_script_tag, '')
if original_script_tag not in html_content:
    print(f"Successfully removed: {original_script_tag} (or it was not found).")


# 4. Define the new script tags in order
# Note: The indentation here includes leading spaces to match typical HTML formatting.
# The actual indentation will depend on where it's inserted.
# The replace logic will handle correct placement relative to the data.js script tag.
new_script_tags_list = [
    '    <script src="utility_functions-refactor.js"></script>',
    '    <script src="api_calls-refactor.js"></script>',
    '    <script src="ui_updates-refactor.js"></script>',
    '    <script src="ui_setup-refactor.js"></script>',
    '    <script src="state_management-refactor.js"></script>',
    '    <script src="event_handlers-refactor.js"></script>',
    '    <script src="main_script-refactor.js"></script>'
]
new_script_tags_block = "\n".join(new_script_tags_list)

# 5. Add the new script tags after data.js or before </body>
data_js_tag = '<script src="data.js"></script>'
body_closing_tag = '</body>'

if data_js_tag in html_content:
    # Ensure the new block is inserted with proper newline separation
    replacement_str = data_js_tag + "\n" + new_script_tags_block
    html_content = html_content.replace(data_js_tag, replacement_str)
    print(f"Inserted new script tags after: {data_js_tag}")
elif body_closing_tag in html_content:
    # Fallback: insert before closing </body> tag
    replacement_str = new_script_tags_block + "\n" + body_closing_tag
    html_content = html_content.replace(body_closing_tag, replacement_str)
    print(f"Inserted new script tags before: {body_closing_tag} (data.js tag not found).")
else:
    # Very unlikely fallback, but good to have a case for it
    print("Warning: data.js script tag and </body> tag not found. Appending scripts to end of file.")
    html_content += "\n" + new_script_tags_block

# 6. Write the modified content back to index-refactor.html
try:
    with open("index-refactor.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    print("index-refactor.html has been updated with new script tags.")
except Exception as e:
    print(f"Error writing to index-refactor.html: {e}")
