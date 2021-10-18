# A Makefile for automating website development and generation

RENDER = hugo
THEME = unbloated
THEME_PATH = ../..
RENDER_OPTS = -D -F -t $(THEME_PATH)
RENDER_SERVE = serve
RENDER_DEBUG = --disableFastRender --renderToDisk --noHTTPCache --ignoreCache
OUT_FILES = public

clean:
	@echo "Cleaning website..."
	@rm -rf $(OUT_FILES)
	@echo "Done!"

html:
	@echo "Building HTML files..."
	@$(RENDER) $(RENDER_OPTS)
	@echo "Done!"

serve:
	@echo "Serving website..."
	$(RENDER) $(RENDER_SERVE)
	@echo "Done!"

debug:
	@echo "Serving website..."
	$(RENDER) $(RENDER_SERVE) $(RENDER_OPTS) $(RENDER_DEBUG)
	@echo "Done!"
