"""
WSGI config for PythonAnywhere deployment.
"""

import os
import sys

# Add your project directory to the sys.path
path = '/home/your_pythonanywhere_username/parties_management/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
