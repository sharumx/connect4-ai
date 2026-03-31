cmake_minimum_required(VERSION 3.16)
project(connect4ai CXX)
set(CMAKE_CXX_STANDARD 17)

# ── Native binary (for testing / CLI) ──────────────────────────────────────
add_library(connect4_core STATIC connect4.cpp ai.cpp)
target_include_directories(connect4_core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

# ── WebAssembly target (requires Emscripten toolchain) ─────────────────────
# Build with:
#   mkdir build-wasm && cd build-wasm
#   emcmake cmake .. -DBUILD_WASM=ON
#   emmake make
option(BUILD_WASM "Build WebAssembly module" OFF)

if(BUILD_WASM)
    add_executable(connect4_wasm bindings.cpp connect4.cpp ai.cpp)
    set_target_properties(connect4_wasm PROPERTIES
        OUTPUT_NAME "connect4"
        SUFFIX ".js"
    )
    target_compile_options(connect4_wasm PRIVATE -O3)
    target_link_options(connect4_wasm PRIVATE
        --bind
        -s MODULARIZE=1
        -s "EXPORT_NAME='createConnect4Module'"
        -s ALLOW_MEMORY_GROWTH=1
        -s NO_EXIT_RUNTIME=1
        -s ASSERTIONS=0
    )
endif()
