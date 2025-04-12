/**
 * 莹磊悦行网站数据加载工具
 * 用于从JSON文件加载数据并处理前端展示
 */

class DataLoader {
    /**
     * 构造函数
     */
    constructor() {
        this.userData = null;
        this.blogData = null;
        this.planData = null;
        this.initialized = false;
    }

    /**
     * 初始化数据加载器
     * @returns {Promise} 初始化完成的Promise
     */
    async init() {
        if (this.initialized) return Promise.resolve();
        
        try {
            // 并行加载所有数据
            const [users, blogs, plans] = await Promise.all([
                this.fetchJSON('data/users.json'),
                this.fetchJSON('data/blogs.json'),
                this.fetchJSON('data/plans.json')
            ]);
            
            this.userData = users;
            this.blogData = blogs;
            this.planData = plans;
            this.initialized = true;
            
            console.log('数据加载完成');
            return Promise.resolve();
        } catch (error) {
            console.error('数据加载失败:', error);
            return Promise.reject(error);
        }
    }

    /**
     * 从URL加载JSON数据
     * @param {string} url - JSON文件URL
     * @returns {Promise} JSON数据的Promise
     */
    async fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * 获取用户信息
     * @param {string} username - 用户名
     * @returns {Object} 用户信息对象
     */
    getUserByUsername(username) {
        if (!this.initialized) throw new Error('请先初始化数据加载器');
        return this.userData.find(user => user.username === username);
    }

    /**
     * 获取所有博客文章
     * @param {Object} filters - 过滤条件对象
     * @returns {Array} 博客文章数组
     */
    getBlogs(filters = {}) {
        if (!this.initialized) throw new Error('请先初始化数据加载器');
        
        let result = [...this.blogData];
        
        // 应用过滤器
        if (filters.author) {
            result = result.filter(blog => blog.author === filters.author);
        }
        
        if (filters.category) {
            result = result.filter(blog => blog.category === filters.category);
        }
        
        if (filters.tag) {
            result = result.filter(blog => blog.tags.includes(filters.tag));
        }
        
        // 排序
        if (filters.sortBy === 'date') {
            result.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (filters.sortBy === 'popularity') {
            result.sort((a, b) => b.views - a.views);
        }
        
        return result;
    }

    /**
     * 获取单篇博客文章
     * @param {number} id - 博客ID
     * @returns {Object} 博客文章对象
     */
    getBlogById(id) {
        if (!this.initialized) throw new Error('请先初始化数据加载器');
        return this.blogData.find(blog => blog.id === id);
    }

    /**
     * 获取所有行程计划
     * @param {Object} filters - 过滤条件对象
     * @returns {Array} 行程计划数组
     */
    getPlans(filters = {}) {
        if (!this.initialized) throw new Error('请先初始化数据加载器');
        
        let result = [...this.planData];
        
        // 应用过滤器
        if (filters.member) {
            result = result.filter(plan => plan.members.includes(filters.member));
        }
        
        if (filters.status) {
            result = result.filter(plan => plan.status === filters.status);
        }
        
        if (filters.destination) {
            result = result.filter(plan => 
                plan.destinations.some(dest => dest.name.includes(filters.destination))
            );
        }
        
        // 日期范围过滤
        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            result = result.filter(plan => new Date(plan.startDate) >= startDate);
        }
        
        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            result = result.filter(plan => new Date(plan.endDate) <= endDate);
        }
        
        // 排序
        if (filters.sortBy === 'date') {
            result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        } else if (filters.sortBy === 'created') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        return result;
    }

    /**
     * 获取单个行程计划
     * @param {number} id - 行程ID
     * @returns {Object} 行程计划对象
     */
    getPlanById(id) {
        if (!this.initialized) throw new Error('请先初始化数据加载器');
        return this.planData.find(plan => plan.id === id);
    }
}

// 创建单例实例
const dataLoader = new DataLoader();

// 导出单例
window.dataLoader = dataLoader; 