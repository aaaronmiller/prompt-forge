import re

def extract_function(script_content, func_name):
    # Refined regex: looks for function signature and matches till a '};' or '}' on its own line
    # This handles functions that might not end with a semicolon after the brace.
    pattern = re.compile(
        r"^(?:async\s+)?function\s+" + re.escape(func_name) +  # Optional async, function keyword, and name
        r"\s*\(.*?\)\s*\{" +  # Parameters and opening brace
        r"[\s\S]*?" +          # Non-greedy match for the function body
        r"^\}\s*(?:;)?\s*$",  # Closing brace on its own line, optionally followed by a semicolon, and then end of line
        re.MULTILINE
    )
    match = pattern.search(script_content)
    if match:
        return match.group(0)

    # Fallback for functions that might not have their closing brace on a dedicated line (less ideal but might catch some)
    # This is more greedy and might grab too much if functions are not well-separated or have complex structures.
    pattern_greedy = re.compile(
        r"^(?:async\s+)?function\s+" + re.escape(func_name) +
        r"\s*\(.*?\)\s*\{[\s\S]*?^\};?", # Try to find the final semicolon if it exists
        re.MULTILINE
    )
    match_greedy = pattern_greedy.search(script_content)
    if match_greedy:
        # This greedy match needs to be carefully trimmed if it captures more than one function.
        # For simplicity here, we'll assume it gets one function, but this is a known limitation.
        # A more robust solution would involve balancing braces, which is complex for regex.
        content = match_greedy.group(0)
        # Try to trim to the last '}' if it grabbed too much (e.g. if no semicolon was found)
        last_brace_pos = content.rfind('}')
        if last_brace_pos != -1:
            # Check if there's significant content after the last brace that looks like another function
            if not re.search(r"\bfunction\b", content[last_brace_pos+1:]):
                 return content[:last_brace_pos+1]
        return content


    print(f"Function {func_name} not found by refined regexes.")
    return None

def extract_const_variable(script_content, var_name):
    # Refined regex for const variables (objects or template literals)
    pattern = re.compile(
        r"^const\s+" + re.escape(var_name) + r"\s*=\s*" +
        r"((?:\{[\s\S]*?^\})|(?:`[\s\S]*?^`))\s*;",  # Object {} or template literal `` ending with a semicolon
        re.MULTILINE
    )
    match = pattern.search(script_content)
    if match:
        return match.group(0)
    print(f"Const variable {var_name} not found by refined regex.")
    return None

def extract_global_let_variable(script_content, var_name): # This one seems okay
    pattern = re.compile(r"^let\s+" + re.escape(var_name) + r"\s*=\s*.*?;", re.MULTILINE)
    match = pattern.search(script_content)
    if match:
        return match.group(0)
    print(f"Global let variable {var_name} not found by basic regex.")
    return None

def extract_dom_loaded_content(script_content):
    match = re.search(r"document\.addEventListener\('DOMContentLoaded',\s*function\(\)\s*\{([\s\S]*?)\}\);", script_content)
    if match:
        return match.group(1)
    print("DOMContentLoaded content not found.")
    return ""

# Read the original script.js
try:
    with open("script.js", "r") as f:
        original_script_content = f.read()
except FileNotFoundError:
    print("Error: script.js not found. Make sure it exists in the current directory.")
    exit(1)

# --- Populate utility_functions-refactor.js ---
utility_funcs_names = ["showMessage", "hideMessage", "getCheckedValues", "generateUUID", "generateRandomSeed", "blobToBase64", "downloadResultsText"]
with open("utility_functions-refactor.js", "w") as f:
    f.write("// --- Utility Functions ---\n\n")
    for func_name in utility_funcs_names:
        func_content = extract_function(original_script_content, func_name)
        if func_content:
            f.write(func_content + "\n\n")
        else:
            print(f"Warning: Utility function '{func_name}' was not found in script.js")

# --- Populate ui_setup-refactor.js ---
ui_setup_funcs_names = ["populateDropdowns", "populateWorkflowSelect", "initializeCollapsibleSections", "updateSystemPrompt", "addEventListeners"]
with open("ui_setup-refactor.js", "w") as f:
    f.write("// --- UI Setup Functions ---\n\n")
    for func_name in ui_setup_funcs_names:
        func_content = extract_function(original_script_content, func_name)
        if func_content:
            f.write(func_content + "\n\n")
        else:
            print(f"Warning: UI setup function '{func_name}' was not found in script.js")

# --- Populate ui_updates-refactor.js ---
ui_updates_funcs_names = ["populateModelSelect", "handleWorkflowSelectionChange", "toggleCollapse", "toggleContinuousOptions", "createImageResultPlaceholder", "updateImageResultItem"]
with open("ui_updates-refactor.js", "w") as f:
    f.write("// --- UI Update Functions ---\n\n")
    for func_name in ui_updates_funcs_names:
        func_content = extract_function(original_script_content, func_name)
        if func_content:
            f.write(func_content + "\n\n")
        else:
            print(f"Warning: UI update function '{func_name}' was not found in script.js")

# --- Populate api_calls-refactor.js ---
api_calls_funcs_names = ["callLLMForPrompt", "callImageGenerationAPI", "pollComfyHistory"]
with open("api_calls-refactor.js", "w") as f:
    f.write("// --- API Call Functions ---\n\n")
    for func_name in api_calls_funcs_names:
        func_content = extract_function(original_script_content, func_name)
        if func_content:
            f.write(func_content + "\n\n")
        else:
            print(f"Warning: API call function '{func_name}' was not found in script.js")

# --- Populate event_handlers-refactor.js ---
event_handler_funcs_names = ["handleFeelLucky", "handleGenerateKeywords", "handleGenerateApiPromptClick", "handleSendPromptClick", "resetForm", "addCustomImageEndpointInput", "handleRemoveCustomEndpoint", "handleStopBatch", "handleCopyClick"]
with open("event_handlers-refactor.js", "w") as f:
    f.write("// --- Event Handler Functions ---\n\n")
    for func_name in event_handler_funcs_names:
        func_content = extract_function(original_script_content, func_name)
        if func_content:
            f.write(func_content + "\n\n")
        else:
            print(f"Warning: Event handler function '{func_name}' was not found in script.js")

# --- Populate state_management-refactor.js ---
state_management_funcs_names = ["generateKeywordString", "handleGenerateApiPrompt", "handleSendPromptToImageServices", "startContinuousGenerationLoop", "waitForPollingToComplete", "getSelectedImageEndpoints"]
with open("state_management-refactor.js", "w") as f:
    f.write("// --- State Management and Core Logic Functions ---\n\n")
    for func_name in state_management_funcs_names:
        func_content = extract_function(original_script_content, func_name)
        if func_content:
            f.write(func_content + "\n\n")
        else:
            print(f"Warning: State management function '{func_name}' was not found in script.js")

# --- Populate main_script-refactor.js ---
system_prompt_templates_const = extract_const_variable(original_script_content, "systemPromptTemplates")
comfy_workflow_specifics_const = extract_const_variable(original_script_content, "comfyWorkflowSpecifics")

dom_loaded_inner_content = extract_dom_loaded_content(original_script_content)

dom_elements_declarations = []
if dom_loaded_inner_content:
    dom_const_pattern = re.compile(r"^\s*const\s+[\w\d]+\s*=\s*document\.getElementById\(.*?\);", re.MULTILINE)
    dom_qs_pattern = re.compile(r"^\s*const\s+[\w\d]+\s*=\s*document\.querySelector\(.*?\);", re.MULTILINE)
    dom_qsa_pattern = re.compile(r"^\s*const\s+[\w\d]+\s*=\s*document\.querySelectorAll\(.*?\);", re.MULTILINE)

    for line in dom_loaded_inner_content.splitlines():
        stripped_line = line.strip()
        if dom_const_pattern.match(stripped_line) or \
           dom_qs_pattern.match(stripped_line) or \
           dom_qsa_pattern.match(stripped_line):
            dom_elements_declarations.append(stripped_line)
else:
    print("Warning: Could not extract DOMContentLoaded inner content to find DOM element declarations.")
dom_elements_declarations_str = "\n    ".join(dom_elements_declarations) if dom_elements_declarations else "// No DOM element declarations found or DOMContentLoaded not processed."

main_script_content = f"""// --- Main Orchestrator Script ---

// Assumes data.js is loaded first, then all other -refactor.js files in an appropriate order.

// --- Global Constants (from original script.js) ---
{system_prompt_templates_const or "// systemPromptTemplates not found or error extracting"}

{comfy_workflow_specifics_const or "// comfyWorkflowSpecifics not found or error extracting"}

// --- Global State Variables (originally in script.js) ---
// These are intended to be global for access by other refactored scripts.
let currentSelectedImageEndpoints = [];
const comfyPollingStates = {{}};
let isContinuousModeActive = false;
let continuousRunsRemaining = 0;
let currentContinuousMode = 'keep_keywords_new_api';
let stopBatchFlag = false;

document.addEventListener('DOMContentLoaded', function() {{
    // --- DOM Element References (extracted from original script.js DOMContentLoaded) ---
    {dom_elements_declarations_str}

    // --- Initialization Logic ---
    const mainMessageBox = document.getElementById('mainMessageBox');
    const configMessageBox = document.getElementById('configMessageBox');
    const systemPromptTextarea = document.getElementById('systemPrompt');

    if (typeof dropdownData === 'undefined') {{
        console.error("ERR: dropdownData missing.");
        if (typeof showMessage === 'function' && mainMessageBox) {{
            showMessage(mainMessageBox, 'error', 'Failed to load keyword data (dropdownData).');
        }}
    }} else {{
        if (typeof populateDropdowns === 'function') populateDropdowns(); else console.error('CRITICAL: populateDropdowns function not found.');
    }}

    if (typeof comfyWorkflows === 'undefined') {{
        console.error("ERR: comfyWorkflows missing.");
        if (typeof showMessage === 'function' && configMessageBox) {{
            showMessage(configMessageBox, 'error', 'Failed to load ComfyUI workflows (comfyWorkflows).');
        }}
    }} else {{
        if (typeof populateWorkflowSelect === 'function') populateWorkflowSelect(); else console.error('CRITICAL: populateWorkflowSelect function not found.');
        if (typeof handleWorkflowSelectionChange === 'function') {{
             console.log("MAIN_SCRIPT: Calling initial handleWorkflowSelectionChange()");
             handleWorkflowSelectionChange();
        }} else {{
            console.error('handleWorkflowSelectionChange function not found for initial call');
        }}
    }}

    if (typeof ggufModelFiles === 'undefined') {{
        console.warn("WARN: ggufModelFiles is not defined.");
    }}
    if (typeof checkpointModelFiles === 'undefined') {{
        console.warn("WARN: checkpointModelFiles is not defined.");
    }}

    if (typeof systemPromptTemplates !== 'undefined' && typeof updateSystemPrompt === 'function') {{
        updateSystemPrompt();
    }} else {{
        console.error('updateSystemPrompt function or systemPromptTemplates (global const) not found.');
        if (systemPromptTextarea) systemPromptTextarea.value = "Error loading system prompt templates.";
    }}

    if (typeof initializeCollapsibleSections === 'function') {{
        initializeCollapsibleSections();
    }} else {{
        console.error('initializeCollapsibleSections function not found.');
    }}

    if (typeof addEventListeners === 'function') {{
        addEventListeners();
    }} else {{
        console.error('CRITICAL: addEventListeners function not found.');
    }}

    console.log("Main script DOMContentLoaded initialization sequence complete.");
}});
"""
with open("main_script-refactor.js", "w") as f:
    f.write(main_script_content)

print("Refactoring script execution complete. Review the generated files and any warnings.")
