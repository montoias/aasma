
all:
	unzip proj/deps/Nodus.zip
	mv -f proj/deps/Nodus /Library/Application\ Support/minecraft/versions

npm:
	cd proj/; \
	npm install; \
	cd node_modules; \
	rm -rf mineflayer; \
	git clone https://github.com/andrewrk/mineflayer; \
	cd mineflayer; \
	git checkout -b a35a2d83d37890c402cd8a3ba4bb17803a2f6807; \