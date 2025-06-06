import os

html_file_path = "index-refactor.html"
original_css_link = '<link rel="stylesheet" href="styles.css">'
new_css_link = '<link rel="stylesheet" href="styles-refactor.css">'

try:
    # 1. Read the content of index-refactor.html
    with open(html_file_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # 2. Change the stylesheet link
    if original_css_link in html_content:
        html_content = html_content.replace(original_css_link, new_css_link)
        print(f"Stylesheet link in {html_file_path} updated to '{new_css_link}'.")
    else:
        print(f"Warning: Original stylesheet link '{original_css_link}' not found in {html_file_path}.")
        # As a fallback, try to add it if no other stylesheet link for styles.css or styles-refactor.css exists
        if new_css_link not in html_content and '<link rel="stylesheet" href="styles' not in html_content:
             # Add before closing </head> tag if possible
            head_closing_tag = '</head>'
            if head_closing_tag in html_content:
                html_content = html_content.replace(head_closing_tag, f"    {new_css_link}\n{head_closing_tag}")
                print(f"Added new stylesheet link '{new_css_link}' before {head_closing_tag} as original was not found.")
            else:
                print(f"Warning: Could not find {head_closing_tag} to add the stylesheet link as a fallback.")


    # 3. Write the modified content back to index-refactor.html
    with open(html_file_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    # Step 4 (Copying styles.css) will be handled by a separate bash command

except FileNotFoundError:
    print(f"Error: {html_file_path} not found. Cannot update CSS link.")
    # To prevent the cp command from running if index-refactor.html wasn't even there
    # we might exit, or let the cp command fail. For now, just print.
except Exception as e:
    print(f"An error occurred: {e}")
