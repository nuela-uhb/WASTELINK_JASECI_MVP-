node Root {
    has created_at: str = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime());

    can show_info with entry {
        print("Root node initialized at:", self.created_at);
    }
}
